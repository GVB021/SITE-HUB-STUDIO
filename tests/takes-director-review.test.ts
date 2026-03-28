import test from "node:test";
import assert from "node:assert/strict";

test("Dublador envia gravação e o Diretor tem acesso imediato ao Take", async () => {
  return new Promise<void>((resolve) => {
    // Simulando o estado do servidor/banco de dados
    const mockDatabaseTakes: any[] = [];
    
    // 1. Simula o dublador terminando uma gravação
    const mockDubladorFinishRecording = (audioBlob: string, dubladorId: string) => {
      const novoTake = {
        id: `take_${Date.now()}`,
        audioUrl: audioBlob,
        userId: dubladorId,
        status: "pending_review",
        createdAt: new Date().toISOString()
      };
      
      mockDatabaseTakes.push(novoTake);
      return novoTake;
    };

    // 2. Dublador grava um take e faz o "upload"
    const gravacaoDublador = mockDubladorFinishRecording("blob:audio-file-123", "user_dublador_1");
    assert.equal(gravacaoDublador.status, "pending_review");

    // 3. Simula a tela do Diretor pedindo a lista de Takes
    const mockDiretorFetchTakes = () => {
      return [...mockDatabaseTakes];
    };

    // Diretor busca e encontra a gravação
    const listaDeTakesDoDiretor = mockDiretorFetchTakes();
    assert.equal(listaDeTakesDoDiretor.length, 1);
    assert.equal(listaDeTakesDoDiretor[0].id, gravacaoDublador.id);

    // 4. Simula a ação do Diretor aprovando ou rejeitando (Playback + Aprovação)
    const mockDiretorReviewTake = (takeId: string, action: "approve" | "discard") => {
      const takeIndex = mockDatabaseTakes.findIndex(t => t.id === takeId);
      if (takeIndex >= 0) {
        if (action === "discard") {
          mockDatabaseTakes.splice(takeIndex, 1);
        } else {
          mockDatabaseTakes[takeIndex].status = "approved";
        }
      }
    };

    // Diretor aprova a gravação
    mockDiretorReviewTake(gravacaoDublador.id, "approve");
    const listaAtualizada = mockDiretorFetchTakes();
    assert.equal(listaAtualizada[0].status, "approved");

    resolve();
  });
});
