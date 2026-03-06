package com.amine.taskplan

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.ui.Messages
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

class WakeAndDiagnoseAction : AnAction() {
    private val httpClient = HttpClient.newHttpClient()

    override fun actionPerformed(event: AnActionEvent) {
        val healthRequest = HttpRequest.newBuilder()
            .uri(URI.create("http://127.0.0.1:42670/health"))
            .GET()
            .build()

        val diagnosticsRequest = HttpRequest.newBuilder()
            .uri(URI.create("http://127.0.0.1:42670/diagnostics/chain"))
            .GET()
            .build()

        val healthResponse = httpClient.send(healthRequest, HttpResponse.BodyHandlers.ofString())
        val diagnosticsResponse = httpClient.send(diagnosticsRequest, HttpResponse.BodyHandlers.ofString())

        Messages.showInfoMessage(
            event.project,
            "Health: ${healthResponse.body()}\n\nDiagnostics: ${diagnosticsResponse.body()}",
            "Wake And Diagnose"
        )
    }
}
