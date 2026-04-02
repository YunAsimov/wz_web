package com.wzweb.backend.account;

import com.wzweb.backend.auth.AppUser;
import com.wzweb.backend.match.MatchRecordRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class GameAccountService {

    private final GameAccountRepository repository;
    private final MatchRecordRepository matchRecordRepository;

    public GameAccountService(GameAccountRepository repository, MatchRecordRepository matchRecordRepository) {
        this.repository = repository;
        this.matchRecordRepository = matchRecordRepository;
    }

    @Transactional(readOnly = true)
    public List<GameAccountResponse> list(Long ownerId) {
        return repository.findAllByOwner_IdOrderByPrimaryAccountDescCreatedAtAscIdAsc(ownerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public GameAccountResponse create(AppUser owner, GameAccountRequest request) {
        String normalizedName = normalizeName(request.name());
        repository.findByOwner_IdAndName(owner.getId(), normalizedName).ifPresent((existing) -> {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "该游戏账号已存在");
        });

        GameAccount entity = new GameAccount();
        entity.setOwner(owner);
        entity.setName(normalizedName);
        entity.setPrimaryAccount(repository.countByOwner_Id(owner.getId()) == 0);
        return toResponse(repository.save(entity));
    }

    @Transactional
    public GameAccountResponse update(Long ownerId, Long id, GameAccountRequest request) {
        GameAccount account = repository.findByIdAndOwner_Id(id, ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "游戏账号不存在"));

        String normalizedName = normalizeName(request.name());
        if (!account.getName().equals(normalizedName)) {
            repository.findByOwner_IdAndName(ownerId, normalizedName).ifPresent((existing) -> {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "该游戏账号已存在");
            });

            String previousName = account.getName();
            account.setName(normalizedName);
            repository.save(account);
            matchRecordRepository.updateAccountNameForOwner(ownerId, previousName, normalizedName);
        }

        return toResponse(account);
    }

    @Transactional
    public void delete(Long ownerId, Long id) {
        GameAccount account = repository.findByIdAndOwner_Id(id, ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "游戏账号不存在"));

        boolean wasPrimary = account.isPrimaryAccount();
        repository.delete(account);

        if (wasPrimary) {
            repository.findAllByOwner_IdOrderByPrimaryAccountDescCreatedAtAscIdAsc(ownerId)
                    .stream()
                    .findFirst()
                    .ifPresent((nextPrimary) -> {
                        if (!nextPrimary.isPrimaryAccount()) {
                            nextPrimary.setPrimaryAccount(true);
                            repository.save(nextPrimary);
                        }
                    });
        }
    }

    private String normalizeName(String name) {
        if (name == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "请填写游戏账号名称");
        }

        String normalized = name.trim();
        if (normalized.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "请填写游戏账号名称");
        }

        if (normalized.length() > 80) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "游戏账号名称长度不能超过 80 个字符");
        }

        return normalized;
    }

    private GameAccountResponse toResponse(GameAccount entity) {
        return new GameAccountResponse(entity.getId(), entity.getName(), entity.isPrimaryAccount());
    }
}
