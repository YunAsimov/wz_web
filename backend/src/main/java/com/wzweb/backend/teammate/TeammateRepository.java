package com.wzweb.backend.teammate;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeammateRepository extends JpaRepository<Teammate, Long> {

    List<Teammate> findAllByOwner_IdOrderByNameAsc(Long ownerId);

    Optional<Teammate> findByOwner_IdAndNameIgnoreCase(Long ownerId, String name);

    Optional<Teammate> findByIdAndOwner_Id(Long id, Long ownerId);

    List<Teammate> findAllByOwner_IdAndIdIn(Long ownerId, Iterable<Long> ids);
}
