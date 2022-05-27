const users = []

//addUser,removeUser , getUser , getUsersInRoom

const addUser = ({id,Username,Room})=>{
    //clean the data
    Username =Username.trim().toLowerCase()
    Room = Room.trim().toLowerCase()

    //validate the data
    if(!Username || !Room) {
        return {
            error:'Username and Room are Required'
        }
    }

    //check for existing user
    const existingUser = users.find((user) =>{
        return user.Room === Room && user.Username === Username
    })


    //validate username
    if(existingUser){
        return{
            error:'Username is in use'
        }
    }

    //only run when user is ready to store
    const user = {id , Username , Room}
    users.push(user)
    return{ user }
}
//removing a user
const removeUser = (id)=>{
    const index = users.findIndex((user)=>user.id === id)

    if(index !== -1){
        return users.splice(index,1)[0]
    }
}

//getting a user by his Id
const getUser = (id)=>{
    return users.find((user)=> user.id === id)

}

//getusersinroom 
const getUserInRoom = (Room)=>{
    Room = Room.trim().toLowerCase()
    return users.filter((user)=> user.Room === Room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}