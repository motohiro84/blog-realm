FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY build/libs/blog-admin-server-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 4000
ENTRYPOINT ["java", "-jar", "app.jar"]
