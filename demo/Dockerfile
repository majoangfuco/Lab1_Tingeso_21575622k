# Why: We choose the 'Alpine' variant because it is extremely lightweight (small file size)
# and contains only the bare necessities. This reduces the deployment time and minimizes
# the security attack surface compared to a full Linux OS image.
FROM eclipse-temurin:17-jdk-alpine

# Why: We rename the specific build artifact (which might have version numbers like 'toolrent-1.0.0.jar')
# to a generic 'app.jar'. This allows the ENTRYPOINT command below to remain constant
# regardless of version changes in future builds.
COPY target/*.jar app.jar

# ENDPOINT EXPOSURE: This documentation instruction informs Docker that the container
# listens on port 8090 at runtime. It must match the 'server.port' defined in application.properties.
EXPOSE 8090

# Why: We use the array format ["cmd", "arg"] (exec form) instead of a plain string.
# This ensures the Java process becomes PID 1, allowing it to receive system signals
# (like SIGTERM) correctly for a graceful shutdown when you stop the container.
ENTRYPOINT ["java","-jar","/app.jar"]