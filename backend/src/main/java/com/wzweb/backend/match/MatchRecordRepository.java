package com.wzweb.backend.match;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MatchRecordRepository extends JpaRepository<MatchRecord, Long> {

    @EntityGraph(attributePaths = "teammates")
    List<MatchRecord> findAllByOwner_IdOrderByDateDescIdDesc(Long ownerId);

    @EntityGraph(attributePaths = "teammates")
    Optional<MatchRecord> findByIdAndOwner_Id(Long id, Long ownerId);

    @EntityGraph(attributePaths = "teammates")
    List<MatchRecord> findAllByOwner_IdAndTeammates_Id(Long ownerId, Long teammateId);

    @Modifying
    @Query("update MatchRecord match set match.accountName = :nextName where match.owner.id = :ownerId and match.accountName = :previousName")
    int updateAccountNameForOwner(@Param("ownerId") Long ownerId, @Param("previousName") String previousName, @Param("nextName") String nextName);
}
