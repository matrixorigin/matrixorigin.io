package com.ning.codebot.common.user.controller;

import com.ning.codebot.common.common.utils.JsonUtils;
import com.ning.codebot.common.user.config.Oauth2Properties;
import com.ning.codebot.common.user.domain.dto.GithubUserInfo;
import com.ning.codebot.common.user.service.Outh2Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.client.RestTemplate;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@Controller
public class GithubController {
    private final Oauth2Properties oauth2Properties;
    @Autowired
    private Outh2Service outh2Service;
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
     * @param code GitHub redirect Auth code
     * @return
     */
    @GetMapping("/oauth2/callback")
    public String callback(@RequestParam("code") String code, @RequestParam("state") String state) {
        log.info("code={}", code);
        log.info("state={}", state);
        // code -> token
        String accessToken = getAccessToken(code);
        // token -> userInfo
        String userInfo = getUserInfo(accessToken);
        outh2Service.storeUserInfo(Integer.parseInt(state), new GithubUserInfo(JsonUtils.toJsonNode(userInfo)));
        log.info("redirect to the home page");
        return "redirect:/test";
    }

    @GetMapping("/test")
    public String home() {
        return "hello world";
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
         String accessToken = JsonUtils.toJsonNode(responseStr).get("access_token").asText();
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
