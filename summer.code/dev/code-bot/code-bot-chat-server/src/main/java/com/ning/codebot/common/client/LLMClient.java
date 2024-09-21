package com.ning.codebot.common.client;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class LLMClient {
    private final RestTemplate restTemplate;

    public LLMClient() {
        this.restTemplate = new RestTemplate();
    }

    public String sendMsg(String repoName, Long userID, String question) {
        // Construct the URL dynamically
        String url = String.format("http://localhost:8080/talks/%s/%d/%s", repoName, userID, question);
        // Make a GET request and return the response
        return restTemplate.getForObject(url, String.class);
    }

    public boolean subscribeRepo(String repoName, String userName){
        // Construct the URL dynamically
        String url = String.format("http://localhost:8080/repos/%s/%s", repoName, userName);
        // Make a GET request and return the response
        try {
            ResponseEntity<String> responseEntity = restTemplate.getForEntity(url, String.class);
            // Check if the response status code is 200 OK
            return responseEntity.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            System.err.println("Error occurred: " + e.getMessage());
            return false;
        }
    }
}