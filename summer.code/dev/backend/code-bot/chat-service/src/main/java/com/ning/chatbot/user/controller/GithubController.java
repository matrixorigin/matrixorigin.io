package com.ning.chatbot.user.controller;

import com.alibaba.fastjson.JSONObject;
import com.ning.chatbot.user.config.Oauth2Properties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Description: GITHUB API interact interface
 * Author: Ning
 * Date: 2024-07-12
 */
@Slf4j
@Controller
public class GithubController {
    private final Oauth2Properties oauth2Properties;

    public GithubController(Oauth2Properties oauth2Properties) {
        this.oauth2Properties = oauth2Properties;
    }

    /*
    * Let user jump to GITHUB page
     */
    @GetMapping("/authorize")
    public String authorize() {
        String url = oauth2Properties.getAuthorizeUrl() +
                "?client_id=" + oauth2Properties.getClientId() +
                "&redirect_uri=" + oauth2Properties.getRedirectUrl();
        log.info("Auth url:{}", url);
        return "redirect:" + url;
    }

    /**
     * Call back func. GITHUB will call this func when user agree the auth.
     *
     * @param code GitHub redirect Auth code
     * @return
     */
    @GetMapping("/oauth2/callback")
    public String callback(@RequestParam("code") String code) {
        log.info("code={}", code);
        // code -> token
        String accessToken = getAccessToken(code);
        // token -> userInfo
        String userInfo = getUserInfo(accessToken);
        log.info("redirect to the home page");
        return "redirect:/home";
    }

    /*
     * Send Post Req to the GITHUB to get the access token
     */
    private String getAccessToken(String code) {
        String url = oauth2Properties.getAccessTokenUrl() +
                "?client_id=" + oauth2Properties.getClientId() +
                "&client_secret=" + oauth2Properties.getClientSecret() +
                "&code=" + code +
                "&grant_type=authorization_code";
        log.info("getAccessToken url:{}", url);
        // Build request header
        HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.add("accept", "application/json");
        // Build entity
        HttpEntity<String> requestEntity = new HttpEntity<>(requestHeaders);
        RestTemplate restTemplate = new RestTemplate();
        // Post Req
        ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
        String responseStr = response.getBody();
        log.info("responseStr={}", responseStr);

        // Parse Json
        JSONObject jsonObject = JSONObject.parseObject(responseStr);
        String accessToken = jsonObject.getString("access_token");
        log.info("accessToken={}", accessToken);
        return accessToken;
    }

    /*
     * Get user Info through Token
     */
    private String getUserInfo(String accessToken) {
        String url = oauth2Properties.getUserInfoUrl();
        log.info("getUserInfo url:{}", url);

        HttpHeaders requestHeaders = new HttpHeaders();

        requestHeaders.add("accept", "application/json");

        requestHeaders.add("Authorization", "token " + accessToken);

        HttpEntity<String> requestEntity = new HttpEntity<>(requestHeaders);
        RestTemplate restTemplate = new RestTemplate();

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, String.class);
        String userInfo = response.getBody();
        log.info("userInfo={}", userInfo);
        return userInfo;
    }


}
