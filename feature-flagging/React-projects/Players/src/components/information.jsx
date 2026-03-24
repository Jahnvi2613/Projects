import React, { useState } from 'react';


const Players = [
    { name: "Aditya", id: 101, role: "Bowler" },
    { name: "Aman", id: 102, role: "Fielding" },
    { name: "Anuj", id: 103, role: "Batsman" },
];

function Player() {
    const [search, setSearch] = useState("");
    const filteredPlayers = Players.filter(player =>
        player.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="player-info">
            <h1>Players Information</h1>
            <input 
                type="text"
                placeholder="Search by role"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
            />
            {filteredPlayers.map(player => (
                <div key={player.id}>
                    <strong>{player.name}</strong>
                    <p>ID: {player.id}</p>
                    <p>Role: {player.role}</p>
                </div>
            ))}
        </div>
    );
}

export default Player;