package com.auction.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    /**
     * CORS 설정 - React(5173) → Spring Boot(8080) 통신 허용
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost", "http://bidmarket.kro.kr")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    /**
     * 업로드된 이미지 파일을 URL로 접근할 수 있도록 설정
     * 절대 경로로 변환하여 Tomcat 경로 문제 방지
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absolutePath = Paths.get(uploadDir).toAbsolutePath().normalize().toString();
        // Windows: file:///C:/rwork/backend/uploads/
        // Mac/Linux: file:///home/user/backend/uploads/
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:///" + absolutePath + "/");
    }
}
