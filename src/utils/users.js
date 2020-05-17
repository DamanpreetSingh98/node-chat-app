const users = []

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (!username || !room) {
        return {
            error: 'Username and room is required!'
        }
    }

    const existingUser = users.find((user) => {
        return user.username === username && user.room === room
    })

    if (existingUser) {
        return {
            error: 'Username is already taken!'
        }
    }

    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const user = users.find((user) => user.id === id)
    return user;
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    const usersList = users.filter((user) => user.room === room)
    return usersList;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}