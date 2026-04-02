package com.wzweb.backend.match;

import com.wzweb.backend.auth.AppUser;
import com.wzweb.backend.teammate.Teammate;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "match_records")
public class MatchRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_user_id")
    private AppUser owner;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "account_name", length = 80)
    private String accountName;

    @Column(nullable = false, length = 20)
    private String season;

    @Column(name = "queue_type", nullable = false, length = 20)
    private String queueType;

    @Column(nullable = false, length = 20)
    private String role;

    @Column(nullable = false, length = 20)
    private String result;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "match_record_teammates",
            joinColumns = @JoinColumn(name = "match_record_id"),
            inverseJoinColumns = @JoinColumn(name = "teammate_id")
    )
    @OrderBy("name asc")
    private Set<Teammate> teammates = new LinkedHashSet<>();

    public Long getId() {
        return id;
    }

    public AppUser getOwner() {
        return owner;
    }

    public void setOwner(AppUser owner) {
        this.owner = owner;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public String getSeason() {
        return season;
    }

    public void setSeason(String season) {
        this.season = season;
    }

    public String getQueueType() {
        return queueType;
    }

    public void setQueueType(String queueType) {
        this.queueType = queueType;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public Set<Teammate> getTeammates() {
        return teammates;
    }

    public void setTeammates(Set<Teammate> teammates) {
        this.teammates = teammates;
    }
}
