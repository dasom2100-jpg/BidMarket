package com.auction.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FileUploadService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    /**
     * 단일 파일 업로드
     * @return 저장된 파일의 URL 경로 (예: /uploads/products/uuid.jpg)
     */
    public String uploadFile(MultipartFile file, String subDir) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("빈 파일입니다");
        }

        // 파일 확장자 검증
        String originalName = file.getOriginalFilename();
        String extension = getExtension(originalName);
        if (!isImageExtension(extension)) {
            throw new IllegalArgumentException("이미지 파일만 업로드 가능합니다 (jpg, jpeg, png, gif, webp)");
        }

        // 저장 디렉토리 생성 (절대 경로로 변환)
        Path dirPath = Paths.get(uploadDir, subDir).toAbsolutePath().normalize();
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }

        // UUID 파일명으로 저장 (파일명 충돌 방지)
        String savedFileName = UUID.randomUUID().toString() + "." + extension;
        Path filePath = dirPath.resolve(savedFileName);

        // InputStream으로 복사 (Tomcat 임시파일 경로 문제 방지)
        Files.copy(file.getInputStream(), filePath);

        // URL 경로 반환
        return "/uploads/" + subDir + "/" + savedFileName;
    }

    /**
     * 복수 파일 업로드
     */
    public List<String> uploadFiles(List<MultipartFile> files, String subDir) throws IOException {
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                urls.add(uploadFile(file, subDir));
            }
        }
        return urls;
    }

    /**
     * 파일 삭제
     */
    public void deleteFile(String fileUrl) {
        try {
            // /uploads/products/uuid.jpg → ./uploads/products/uuid.jpg
            String relativePath = fileUrl.replaceFirst("^/uploads/", "");
            Path filePath = Paths.get(uploadDir, relativePath);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // 삭제 실패해도 비즈니스 로직은 계속 진행
        }
    }

    private String getExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) return "";
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }

    private boolean isImageExtension(String ext) {
        return ext.equals("jpg") || ext.equals("jpeg") || ext.equals("png")
                || ext.equals("gif") || ext.equals("webp");
    }
}
