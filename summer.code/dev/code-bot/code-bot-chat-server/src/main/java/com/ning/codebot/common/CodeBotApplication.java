package com.ning.codebot.common;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication(scanBasePackages = {"com.ning.codebot"})
@MapperScan({"com.ning.codebot.common.**.mapper"})
public class CodeBotApplication {

    public static void main(String[] args) {
        SpringApplication.run(CodeBotApplication.class,args);
    }

}