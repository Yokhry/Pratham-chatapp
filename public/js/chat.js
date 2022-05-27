const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#sendLocation')
const $messages = document.querySelector('#messages')   //location to render the template


//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessage = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


//Options
const {Username , Room} = Qs.parse(location.search,{ ignoreQueryPrefix: true})



const autoScroll = ()=>{
    //New message element
    const $newMessage = $messages.lastElementChild

    //height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container

    const containerHeight = $messages.scrollHeight

    //how far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if( containerHeight -  newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}




socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        Username: message.Username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()

})

socket.on('locationMessage',(message)=>{
    console.log(message)
    const html = Mustache.render(locationMessage,{
        Username: message.Username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})


socket.on('RoomData',({Room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        Room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')
    //disable
    const message = e.target.elements.message.value       //it will be helpful if we have more than one input option so that the app dont crash

    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value= ''
        $messageFormInput.focus()
        //enable
        if(error){
            return console.log(error)
        }

        console.log('Message Delivered!')
    })
})



$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    //disable
    navigator.geolocation.getCurrentPosition((position)=>{
        
        //console.log(position)
        socket.emit('sendLocation',{    
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location Shared!!')
        })
    })
})

socket.emit('join',{Username,Room},(error)=>{
    if(error){
        alert(error)
        location.href= '/'
    }
})