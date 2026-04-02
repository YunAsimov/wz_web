package com.wzweb.backend.teammate;

import com.wzweb.backend.auth.AppUser;
import com.wzweb.backend.match.MatchRecord;
import com.wzweb.backend.match.MatchRecordRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TeammateService {

    private final TeammateRepository teammateRepository;
    private final MatchRecordRepository matchRecordRepository;

    public TeammateService(TeammateRepository teammateRepository, MatchRecordRepository matchRecordRepository) {
        this.teammateRepository = teammateRepository;
        this.matchRecordRepository = matchRecordRepository;
    }

    @Transactional(readOnly = true)
    public List<TeammateResponse> list(Long ownerId) {
        return teammateRepository.findAllByOwner_IdOrderByNameAsc(ownerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TeammateResponse create(AppUser owner, TeammateRequest request) {
        String normalizedName = normalizeName(request.name());
        if (normalizedName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "队友名称不能为空");
        }

        if (teammateRepository.findByOwner_IdAndNameIgnoreCase(owner.getId(), normalizedName).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "该队友名称已存在");
        }

        Teammate teammate = new Teammate();
        teammate.setOwner(owner);
        teammate.setName(normalizedName);
        return toResponse(teammateRepository.save(teammate));
    }

    @Transactional
    public void delete(Long ownerId, Long id) {
        Teammate teammate = teammateRepository.findByIdAndOwner_Id(id, ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "队友不存在"));

        List<MatchRecord> relatedMatches = matchRecordRepository.findAllByOwner_IdAndTeammates_Id(ownerId, id);
        for (MatchRecord match : relatedMatches) {
            match.getTeammates().removeIf(item -> id.equals(item.getId()));
        }

        teammateRepository.delete(teammate);
    }

    private TeammateResponse toResponse(Teammate teammate) {
        return new TeammateResponse(teammate.getId(), teammate.getName());
    }

    private String normalizeName(String value) {
        return value == null ? "" : value.trim();
    }
}
