package com.wzweb.backend.account;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GameAccountRepository extends JpaRepository<GameAccount, Long> {

    List<GameAccount> findAllByOwner_IdOrderByPrimaryAccountDescCreatedAtAscIdAsc(Long ownerId);

    Optional<GameAccount> findByOwner_IdAndName(Long ownerId, String name);

    Optional<GameAccount> findByIdAndOwner_Id(Long id, Long ownerId);

    long countByOwner_Id(Long ownerId);
}
