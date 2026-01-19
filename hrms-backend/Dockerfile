# Use an official OpenJDK runtime as a parent image
FROM eclipse-temurin:17-jdk-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the maven executable wrapper and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Copy the source code
COPY src src

# Make the mvnw executable
RUN chmod +x mvnw

# Package the application
RUN ./mvnw package -DskipTests

# Run the jar file
ENTRYPOINT ["java","-jar","target/hrms-backend-0.0.1-SNAPSHOT.jar"]
