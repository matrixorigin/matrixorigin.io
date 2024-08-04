package com.ning.codebot.common.user.service.impl;

import com.ning.codebot.common.user.config.Oauth2Properties;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class Outh2ServiceImpl {
    private final Oauth2Properties oauth2Properties;

    public Outh2ServiceImpl(Oauth2Properties oauth2Properties) {
        this.oauth2Properties = oauth2Properties;
    }

    // return the redirect url
    public String getRedirectUrl() {
        String url = oauth2Properties.getAuthorizeUrl() +
                "?client_id=" + oauth2Properties.getClientId() +
                "&redirect_uri=" + oauth2Properties.getRedirectUrl();
        log.info("Auth url:{}", url);
        return "redirect:" + url;
    }

}
