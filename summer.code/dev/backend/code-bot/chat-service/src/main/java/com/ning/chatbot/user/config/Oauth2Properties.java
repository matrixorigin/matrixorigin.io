package com.ning.chatbot.user.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "github")
public class Oauth2Properties {
    private String clientId;
    private String clientSecret;
    private String authorizeUrl;
    private String redirectUrl;
    private String accessTokenUrl;
    private String userInfoUrl;
}

