package com.wzweb.backend.migration;

import com.wzweb.backend.auth.AppUser;
import com.wzweb.backend.auth.AppUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class LegacyDataOwnershipMigrationRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(LegacyDataOwnershipMigrationRunner.class);

    private final JdbcTemplate jdbcTemplate;
    private final AppUserRepository appUserRepository;

    public LegacyDataOwnershipMigrationRunner(JdbcTemplate jdbcTemplate, AppUserRepository appUserRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.appUserRepository = appUserRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        ensureOwnerScopedIndexes();

        AppUser legacyOwner = resolveLegacyOwner();
        if (legacyOwner == null) {
            return;
        }

        assignLegacyRows(legacyOwner.getId());
        ensurePrimaryAccount(legacyOwner.getId());
    }

    private void ensureOwnerScopedIndexes() {
        dropSingleColumnUniqueIndexes("teammates", "name");
        dropSingleColumnUniqueIndexes("game_accounts", "name");

        createIndexIfMissing("teammates", "uk_teammates_owner_name", true, "`owner_user_id`, `name`");
        createIndexIfMissing("game_accounts", "uk_game_accounts_owner_name", true, "`owner_user_id`, `name`");
        createIndexIfMissing("match_records", "idx_match_records_owner_user_id", false, "`owner_user_id`");
        createIndexIfMissing("teammates", "idx_teammates_owner_user_id", false, "`owner_user_id`");
        createIndexIfMissing("game_accounts", "idx_game_accounts_owner_user_id", false, "`owner_user_id`");
    }

    private AppUser resolveLegacyOwner() {
        return appUserRepository.findFirstByEnabledTrueAndUsernameNotOrderByIdAsc("admin")
                .or(() -> appUserRepository.findFirstByEnabledTrueOrderByIdAsc())
                .orElse(null);
    }

    private void assignLegacyRows(Long ownerId) {
        int teammateRows = jdbcTemplate.update("UPDATE teammates SET owner_user_id = ? WHERE owner_user_id IS NULL", ownerId);
        int gameAccountRows = jdbcTemplate.update("UPDATE game_accounts SET owner_user_id = ? WHERE owner_user_id IS NULL", ownerId);
        int matchRows = jdbcTemplate.update("UPDATE match_records SET owner_user_id = ? WHERE owner_user_id IS NULL", ownerId);

        if (teammateRows + gameAccountRows + matchRows > 0) {
            log.info("Assigned legacy shared data to userId={} -> teammates={}, gameAccounts={}, matches={}", ownerId, teammateRows, gameAccountRows, matchRows);
        }
    }

    private void ensurePrimaryAccount(Long ownerId) {
        Integer total = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM game_accounts WHERE owner_user_id = ?",
                Integer.class,
                ownerId
        );
        Integer primaryCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM game_accounts WHERE owner_user_id = ? AND is_primary = b'1'",
                Integer.class,
                ownerId
        );

        if (total == null || total == 0 || (primaryCount != null && primaryCount > 0)) {
            return;
        }

        Long firstId = jdbcTemplate.queryForObject(
                "SELECT id FROM game_accounts WHERE owner_user_id = ? ORDER BY created_at ASC, id ASC LIMIT 1",
                Long.class,
                ownerId
        );
        if (firstId != null) {
            jdbcTemplate.update("UPDATE game_accounts SET is_primary = b'1' WHERE id = ?", firstId);
        }
    }

    private void dropSingleColumnUniqueIndexes(String tableName, String columnName) {
        List<String> indexNames = jdbcTemplate.queryForList(
                """
                SELECT INDEX_NAME
                FROM information_schema.STATISTICS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = ?
                  AND NON_UNIQUE = 0
                GROUP BY INDEX_NAME
                HAVING INDEX_NAME <> 'PRIMARY'
                   AND COUNT(*) = 1
                   AND MAX(CASE WHEN COLUMN_NAME = ? THEN 1 ELSE 0 END) = 1
                """,
                String.class,
                tableName,
                columnName
        );

        for (String indexName : indexNames) {
            jdbcTemplate.execute("DROP INDEX `" + indexName + "` ON `" + tableName + "`");
        }
    }

    private void createIndexIfMissing(String tableName, String indexName, boolean unique, String columns) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?",
                Integer.class,
                tableName,
                indexName
        );

        if (count != null && count > 0) {
            return;
        }

        String ddl = (unique ? "CREATE UNIQUE INDEX `" : "CREATE INDEX `") + indexName + "` ON `" + tableName + "` (" + columns + ")";
        jdbcTemplate.execute(ddl);
    }
}
