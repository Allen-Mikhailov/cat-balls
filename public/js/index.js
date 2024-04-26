import { Universe, PhysicsBall, quadraticEase } from "./physics.js"
import ballTypes from "./ball_types.js"

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

const universe = new Universe();
const balls = universe.balls;

const dtCap = 1/10

// Calculating Sizes based on radius

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

function getBallImage(size)
{
    return `url(./imgs/${ballTypes[size].image})`
}

class Ball extends PhysicsBall
{
    constructor(x, y, size)
    {
        super(x, y, .01)
        this.size = size
        this.is_merging = false

        const ballObj = document.createElement("div")
        ballObj.className = "ball"
        ballObj.style.rotate = `${floor(random()*360)}deg`
        ballObj.style.backgroundImage = getBallImage(size)
        ballContainer.appendChild(ballObj)

        this.obj = ballObj

        super.addLerp("r", ballTypes[size].size, .25, quadraticEase)
    }
}

function createBall(posX=.5, posY=0, size=0)
{
    const ball = new Ball(posX, posY, size)

    const id = createId(balls)
    universe.addBall(id, ball)

    const s = meows[floor(random()*meows.length)]
    const sound = new Audio(s[0])
    sound.volume = s[1]
    sound.play()
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

universe.setOnCollision((b1, b2, cx, cy) => {
    const ball1 = balls[b1]
    const ball2 = balls[b2]
    if (ball1.size == ball2.size 
        && ball1.is_merging == false 
        && ball2.is_merging == false)
    {
        score += (ball1.size+1)*10
        scoreUpdate()

        if (ball1.size != ballTypes.length-1)
            createBall(cx, cy, ball1.size+1)

        ball1.setCanCollide(false)
        ball2.setCanCollide(false)
        
        ball1.setAnchored(false)
        ball2.setAnchored(false)

        ball1.is_merging = true 
        ball2.is_merging = true

        ball1.addLerp("x", cx, .25, quadraticEase)
        ball1.addLerp("y", cy, .25, quadraticEase)

        ball2.addLerp("x", cx, .25, quadraticEase)
        ball2.addLerp("y", cy, .25, quadraticEase)

        setTimeout(() => {
            ball1.obj.remove()
            ball2.obj.remove()

            delete balls[b1] 
            delete balls[b2]
        }, 250)

        return;
    }
})

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
        if (ball.y-ball.r < 0 && abs(ball.vy) < .1)
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
        universe.physicsUpdate(dt)
        renderBalls()

        updateBallStyle(nextBallDiv, cx, 0, ballTypes[nextBall].size)

        // Check for game end
        checkForGameEnd(dt)
    }
    

    requestAnimationFrame(update)
}

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