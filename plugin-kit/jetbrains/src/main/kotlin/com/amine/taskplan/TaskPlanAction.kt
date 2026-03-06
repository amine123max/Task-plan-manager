package com.amine.taskplan

import com.fasterxml.jackson.databind.ObjectMapper
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.ui.Messages
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

class TaskPlanAction : AnAction() {
    private val httpClient = HttpClient.newHttpClient()
    private val objectMapper = ObjectMapper()

    override fun actionPerformed(event: AnActionEvent) {
        val input = Messages.showInputDialog(
            event.project,
            "Describe the task",
            "Task Plan Manager",
            Messages.getQuestionIcon()
        ) ?: return

        val requestBody = objectMapper.writeValueAsString(mapOf("text" to input))
        val request = HttpRequest.newBuilder()
            .uri(URI.create("http://127.0.0.1:42670/plan/evaluate"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .build()

        val response = httpClient.send(request, HttpResponse.BodyHandlers.ofString())
        Messages.showInfoMessage(event.project, response.body(), "Task Plan Response")
    }
}
