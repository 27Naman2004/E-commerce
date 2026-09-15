# Stage 1: Build stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Copy pom.xml and download dependencies to optimize caching layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package application jar
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S kanha && adduser -S kanha -G kanha
USER kanha:kanha

# Copy executable jar from builder stage
COPY --from=builder /app/target/kanha-backend-1.0.0-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:prod}", "/app/app.jar"]
