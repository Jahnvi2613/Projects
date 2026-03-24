import React, { useState } from "react";
import "../App.css";

const initialBooks = [
  { title: "1984", author: "George Orwell" },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
  { title: "To Kill a Mockingbird", author: "Harper Lee" }
];

function Library() {
  const [books, setBooks] = useState(initialBooks);
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");

  const filteredBooks = books.filter(
    book =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddBook = () => {
    if (newTitle.trim() && newAuthor.trim()) {
      setBooks([...books, { title: newTitle, author: newAuthor }]);
      setNewTitle("");
      setNewAuthor("");
    }
  };

  const handleRemoveBook = index => {
    setBooks(books.filter((_, idx) => idx !== index));
  };

  return (
    <div className="library-container">
      <div className="library-management">
        <h2>Library Management</h2>
        <input
          type="text"
          placeholder="Search by title or author"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        <div className="add-book-form">
          <input
            type="text"
            placeholder="New book title"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="New book author"
            value={newAuthor}
            onChange={e => setNewAuthor(e.target.value)}
          />
          <button onClick={handleAddBook}>Add Book</button>
        </div>
        <div>
          {filteredBooks.map((book, index) => (
            <div key={index} className="book-item">
              <span>
                <strong>{book.title}</strong> by {book.author}
              </span>
              <button onClick={() => handleRemoveBook(index)} className="remove-btn">Remove</button>
            </div>
          ))}
          {filteredBooks.length === 0 && (
            <div className="no-books">No books found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Library;
