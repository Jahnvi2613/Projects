const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());
let cards = [
  { id: 1, suit: "Hearts", value: "Ace" },
  { id: 2, suit: "Spades", value: "King" },
  { id: 3, suit: "Diamonds", value: "Queen" }
];
app.get('/cards', (req, res) => {
  res.json(cards);
});
app.get('/cards/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const card = cards.find(c => c.id === id);
  if (card) {
    res.json(card);
  } else {
    res.status(404).json({ error: "Card not found" });
  }
});
app.post('/cards', (req, res) => {
  const { suit, value } = req.body;
  if (!suit || !value) {
    return res.status(400).json({ error: "Suit and value are required" });
  }
  const newCard = { id: cards.length ? cards[cards.length - 1].id + 1 : 1, suit, value };
  cards.push(newCard);
  res.status(201).json(newCard);
});
app.delete('/cards/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = cards.findIndex(c => c.id === id);
  if (index !== -1) {
    const deleted = cards.splice(index, 1)[0];
    res.json(deleted);
  } else {
    res.status(404).json({ error: "Card not found" });
  }
});
app.listen(port, () => {
  console.log(`Card API server running at http://localhost:${port}`);
});
