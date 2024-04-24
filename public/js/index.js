import { physicsUpdate } from "./physics.js"

const min = Math.min
const max = Math.max
const abs = Math.abs
const floor = Math.floor
const random = Math.random
const randF = () => {return random()*2-1}
const sqrt = Math.sqrt
const hypot = Math.hypot
const atan2 = Math.atan2
const sin = Math.sin
const cos = Math.cos
const pi = Math.PI
const sign = Math.sign

const ballContainer = document.getElementById("ball-container")
const scoreDisplay = document.getElementById("score-display")
const gameEndTimer = document.getElementById("game-end-countdown")
const restartButton = document.getElementById("restart-button")

const balls = {}
const updatesPerTick = 5
const dtCap = 1/10

const bounceFriction = 1 - .5
const gravity = 1

const ballTypes = [
    {
        image: "c1.jpeg"
    },
    {
        image: "c2.jpg"
    },
    {
        image: "c3.jpg"
    },
    {
        image: "c4.jpg"
    },
    {
        image: "c5.jpg"
    },
    {
        image: "c6.jpeg"
    },
    {
        image: "c7.jpg"
    },
    {
        image: "c8.jpg"
    },
    {
        image: "c9.jpg"
    },
    {
        image: "c10.jpg"
    },
    {
        image: "c11.jpg"
    },
]

// Calculating Sizes based on radius
const startingRadius = .03
let size = startingRadius
ballTypes.map((ball, i) => {
    ball.size = size
    size = sqrt(size*size*1.75)
    console.log(size)
})

const collisionRandomness = 0.000001
const grace = 5

// loading audio
const meows = [
    ["./sfx/meow1.mp3", .08],
    ["./sfx/meow2.mp3", .4],
    ["./sfx/meow3.mp3", .2]
]


let score = 0
let lastTimeStamp = Date.now()
let gameEnd = false

function createId(check)
{
    let id = ""
    for (let i = 0; i < 100; i++)
    {
        id += floor(random()*10)
    }
    if (check[id])
        return createId(check)
    return id
}

function scoreUpdate()
{
    scoreDisplay.innerHTML = ""+score
}

function randomColor()
{
    return `rgb(
        ${100+floor(random()*156)}, 
        ${100+floor(random()*156)}, 
        ${100+floor(random()*156)})`
}
  

const linearEase = (x) => {return x;}
const quadraticEase = (x) => {return x*x;}

function addLerp(ball, property, target, time, ease=linearEase)
{
    ball.lerps.push({
        property: property,
        initial: ball[property],
        target: target,
        dif: target - ball[property],
        start: Date.now(),
        time: time,
        ease: ease
    })

}

function getBallImage(size)
{
    return `url(./imgs/${ballTypes[size].image})`
}

function createBall(posX=.5, posY=0, size=0)
{
    const ballObj = document.createElement("div")
    ballObj.className = "ball"
    ballObj.style.rotate = `${floor(random()*360)}deg`
    ballObj.style.backgroundImage = getBallImage(size)
    // ballObj.style.backgroundColor = randomColor()
    ballContainer.appendChild(ballObj)

    const ball = {
        obj: ballObj,
        x: posX,
        y: posY,
        r: .01,
        lerps: [],
        vx: 0,
        vy: 0,
        size: size,
    }

    addLerp(ball, "r", ballTypes[size].size, .25, quadraticEase)

    const s = meows[floor(random()*meows.length)]
    const sound = new Audio(s[0])
    sound.volume = s[1]
    sound.play()

    balls[createId(balls)] = ball
} 


function updateBallStyle(obj, x, y, r)
{
    obj.style.left = `${(x) * 100}%`
    obj.style.top = `${(y) * 100}%`
    obj.style.width = `${r * 2 *  100}%`
}

function renderBalls()
{
    Object.keys(balls).map((ballN) => {
        const ball = balls[ballN]
        updateBallStyle(ball.obj, ball.x, ball.y, ball.r)
    })
}

let nextBall = 0
const nextBallDiv = document.createElement("div")
nextBallDiv.className = "ball"
ballContainer.appendChild(nextBallDiv)

function newball()
{
    nextBall = floor(random()*3)
    nextBallDiv.style.backgroundImage = getBallImage(nextBall)
}

let gameEndTime = 0

function checkForGameEnd(dt)
{
    let isGameEnd = false
    Object.keys(balls).map((ballN) => {
        const ball = balls[ballN]
        if (ball.y-ball.r < .2 && abs(ball.vy) < .1)
        {
            isGameEnd = true
            // gameEndTime += dt
        } 
    })

    if (isGameEnd)
    {
        gameEndTime += dt
        

        if (gameEndTime>grace)
        {
            gameEndTimer.innerHTML = "Game Ended"
            gameEnd = true
            return
        }
    } else {
        gameEndTime = 0
        gameEndTimer.innerHTML = ""
    }

    gameEndTimer.innerHTML = "" + (gameEndTime > 0.5?floor(gameEndTime*100)/100:"")
}

let cx = 0
let cy = 0

function update()
{
    // dt calculations
    const t = Date.now()
    const dt = min(dtCap, (t-lastTimeStamp)/1000)
    lastTimeStamp = t

    if (!gameEnd)
    {
        // Main stuff
        physicsUpdate(balls, dt)
        renderBalls()

        updateBallStyle(nextBallDiv, cx, 0, ballTypes[nextBall].size)

        // Check for game end
        checkForGameEnd(dt)
    }
    

    requestAnimationFrame(update)
}

// for (let i = 0; i < 20; i++)
//     createBall(.5, .5, floor(random()*4))

ballContainer.onclick = (e) => {
    if (gameEnd) {return;}

    const rect = ballContainer.getBoundingClientRect()
    createBall((e.clientX-rect.left)/rect.width, 0, nextBall)

    newball()
} 

ballContainer.onmousemove = (e) => {
    const rect = ballContainer.getBoundingClientRect()
    cx = (e.clientX-rect.left)/rect.width
    cy = (e.clientY-rect.top)/rect.height
}

newball()
update()
scoreUpdate()

restartButton.onclick = () => {
    Object.keys(balls).map((ballN) => {
        const ball = balls[ballN]
        ball.obj.remove()
        delete balls[ballN]
    })
    
    score = 0
    gameEnd = false
    gameEndTime = 0
    newball()
    scoreUpdate()
}