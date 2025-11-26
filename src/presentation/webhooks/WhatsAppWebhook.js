/**
 * Webhook de WhatsApp
 * Maneja las peticiones HTTP del webhook de WhatsApp
 */
class WhatsAppWebhook {
    constructor(handleUserMessageUseCase, config) {
        this.handleUserMessageUseCase = handleUserMessageUseCase;
        this.config = config;
    }

    /**
     * Maneja la verificación del webhook (GET)
     */
    handleVerification(req, res) {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode && token && mode === 'subscribe' && token === this.config.whatsapp.verifyToken) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }

    /**
     * Maneja los mensajes entrantes (POST)
     */
    async handleIncomingMessage(req, res) {
        const body = req.body;

        try {
            if (body.object) {
                if (
                    body.entry &&
                    body.entry[0].changes &&
                    body.entry[0].changes[0].value.messages &&
                    body.entry[0].changes[0].value.messages[0]
                ) {
                    const messageObj = body.entry[0].changes[0].value.messages[0];
                    const from = messageObj.from;

                    console.log(`Mensaje recibido de ${from}`);

                    // Verificar si es un mensaje de texto o una respuesta interactiva
                    if (messageObj.type === 'interactive') {
                        let buttonId;
                        if (messageObj.interactive.type === 'button_reply') {
                            buttonId = messageObj.interactive.button_reply.id;
                        } else if (messageObj.interactive.type === 'list_reply') {
                            buttonId = messageObj.interactive.list_reply.id;
                        }

                        if (buttonId) {
                            await this.handleUserMessageUseCase.handleButtonResponse(from, buttonId);
                        }
                    } else {
                        await this.handleUserMessageUseCase.handleTextMessage(from);
                    }
                }
                res.sendStatus(200);
            } else {
                res.sendStatus(404);
            }
        } catch (error) {
            console.error('Error procesando webhook:', error);
            res.sendStatus(200); // Siempre responder 200 para evitar reintentos
        }
    }
}

module.exports = WhatsAppWebhook;
