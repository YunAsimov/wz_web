package com.wzweb.backend.match;

import com.wzweb.backend.auth.AppUser;
import com.wzweb.backend.teammate.Teammate;
import com.wzweb.backend.teammate.TeammateRepository;
import com.wzweb.backend.teammate.TeammateResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class MatchService {

    private static final String LEGACY_ACCOUNT_NAME = "未命名账号";

    private final MatchRecordRepository repository;
    private final TeammateRepository teammateRepository;

    public MatchService(MatchRecordRepository repository, TeammateRepository teammateRepository) {
        this.repository = repository;
        this.teammateRepository = teammateRepository;
    }

    @Transactional(readOnly = true)
    public List<MatchResponse> list(Long ownerId) {
        return repository.findAllByOwner_IdOrderByDateDescIdDesc(ownerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public MatchResponse create(AppUser owner, MatchRequest request) {
        MatchRecord entity = new MatchRecord();
        entity.setOwner(owner);
        MatchRecord saved = repository.save(applyRequest(entity, request, owner.getId()));
        return toResponse(saved);
    }

    @Transactional
    public List<MatchResponse> createBatch(AppUser owner, List<MatchRequest> requests) {
        List<MatchRecord> saved = repository.saveAll(requests.stream()
                .map(request -> {
                    MatchRecord entity = new MatchRecord();
                    entity.setOwner(owner);
                    return applyRequest(entity, request, owner.getId());
                })
                .toList());
        return saved.stream().map(this::toResponse).toList();
    }

    @Transactional
    public MatchResponse update(Long ownerId, Long id, MatchRequest request) {
        MatchRecord entity = repository.findByIdAndOwner_Id(id, ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "对局记录不存在"));
        MatchRecord saved = repository.save(applyRequest(entity, request, ownerId));
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long ownerId, Long id) {
        MatchRecord match = repository.findByIdAndOwner_Id(id, ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "对局记录不存在"));
        match.getTeammates().clear();
        repository.delete(match);
    }

    private MatchRecord applyRequest(MatchRecord entity, MatchRequest request, Long ownerId) {
        entity.setDate(request.date());
        entity.setAccountName(normalizeAccountName(request.accountName()));
        entity.setSeason(request.season());
        entity.setQueueType(request.queueType());
        entity.setRole(request.role());
        entity.setResult(request.result());
        entity.setTeammates(resolveTeammates(ownerId, request.queueType(), request.teammateIds()));
        return entity;
    }

    private String normalizeAccountName(String accountName) {
        if (accountName == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "请填写游戏账号名称");
        }

        String normalized = accountName.trim();
        if (normalized.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "请填写游戏账号名称");
        }

        return normalized;
    }

    private String displayAccountName(String accountName) {
        if (accountName == null) {
            return LEGACY_ACCOUNT_NAME;
        }

        String normalized = accountName.trim();
        return normalized.isEmpty() ? LEGACY_ACCOUNT_NAME : normalized;
    }

    private Set<Teammate> resolveTeammates(Long ownerId, String queueType, List<Long> teammateIds) {
        List<Long> normalizedIds = teammateIds == null
                ? List.of()
                : teammateIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        int maxTeammates = resolveTeammateLimit(queueType);
        if (normalizedIds.size() > maxTeammates) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, queueType + "最多只能选择 " + maxTeammates + " 名队友");
        }

        if (normalizedIds.isEmpty()) {
            return new LinkedHashSet<>();
        }

        Map<Long, Teammate> teammateMap = teammateRepository.findAllByOwner_IdAndIdIn(ownerId, normalizedIds)
                .stream()
                .collect(Collectors.toMap(Teammate::getId, Function.identity()));

        if (teammateMap.size() != normalizedIds.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "所选队友不存在、已被删除或不属于当前用户");
        }

        Set<Teammate> teammates = new LinkedHashSet<>();
        for (Long teammateId : normalizedIds) {
            teammates.add(teammateMap.get(teammateId));
        }
        return teammates;
    }

    private int resolveTeammateLimit(String queueType) {
        return switch (queueType) {
            case "单排" -> 0;
            case "双排" -> 1;
            case "三排" -> 2;
            case "五排" -> 4;
            default -> 4;
        };
    }

    private MatchResponse toResponse(MatchRecord entity) {
        List<TeammateResponse> teammates = entity.getTeammates()
                .stream()
                .map(teammate -> new TeammateResponse(teammate.getId(), teammate.getName()))
                .toList();

        return new MatchResponse(
                entity.getId(),
                entity.getDate(),
                displayAccountName(entity.getAccountName()),
                entity.getSeason(),
                entity.getQueueType(),
                entity.getRole(),
                entity.getResult(),
                teammates
        );
    }
}
