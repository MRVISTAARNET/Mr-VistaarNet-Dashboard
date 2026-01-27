# Use an official OpenJDK runtime as a parent image
FROM eclipse-temurin:17-jdk

# Set the working directory in the container
WORKDIR /app

# Copy the maven executable wrapper and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Copy the source code
COPY src src

# Install necessary tools
RUN apt-get update && apt-get install -y dos2unix

# Make the mvnw executable and fix line endings
RUN dos2unix mvnw && chmod +x mvnw

# Package the application
RUN ./mvnw package -DskipTests

# Run the jar file
ENTRYPOINT ["java","-jar","target/hrms-backend-0.0.1-SNAPSHOT.jar"]
