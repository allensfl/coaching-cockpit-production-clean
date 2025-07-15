// /api/sync-message.js - Funktionierende Chat-Synchronisation
let messages = [];

export default function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS Request für CORS Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    // Neue Nachricht speichern
    const { sender, content, timestamp, phase } = req.body;
    
    if (!sender || !content) {
      return res.status(400).json({ 
        error: 'Sender und Content sind erforderlich',
        received: req.body 
      });
    }

    const newMessage = {
      id: Date.now() + Math.random(),
      sender: sender,
      content: content,
      timestamp: timestamp || new Date().toISOString(),
      phase: phase || '1'
    };

    messages.push(newMessage);
    
    // Nur die letzten 50 Nachrichten behalten (Memory-Management)
    if (messages.length > 50) {
      messages = messages.slice(-50);
    }

    console.log('Neue Nachricht gespeichert:', newMessage);

    return res.status(200).json({ 
      success: true, 
      message: newMessage,
      total: messages.length,
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === 'GET') {
    // Alle Nachrichten zurückgeben
    return res.status(200).json({ 
      messages: messages,
      total: messages.length,
      timestamp: new Date().toISOString()
    });
  }

  // Unsupported method
  return res.status(405).json({ 
    error: 'Method not allowed',
    method: req.method,
    allowedMethods: ['GET', 'POST', 'OPTIONS']
  });
}