package com.ning.codebot.common.user.domain.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

@Data
public class GithubUserInfo{
    private String userName;
    private String avatarUrl;
    private String nodeId;

    public GithubUserInfo(JsonNode node){
        this.userName = node.get("login").asText();
        this.nodeId = node.get("node_id").asText();
        this.avatarUrl = node.get("avatar_url").asText();
    }
}
