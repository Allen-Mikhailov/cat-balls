const ballContainer = document.getElementById("ball-container")

const balls = []
const updatesPerTick = 3
const dtCap = 1/10

const ballSizes = [.5, .10, .15, .20]

let lastTimeStamp = Date.now()

function createBall(posX=.5, posY=0, size=0)
{
    const ballObj = document.createElement("div")
    ballObj.className = "ball"
    ballContainer.appendChild(ballObj)

    const ball = {
        obj: ballObj,
        x: posX,
        y: posY,
    }

    balls.push(ball)
} 

// #region Physics

function circleCollisions(dt)
{

}

function lineCollisions(dt)
{

}

function movementUpdate(dt)
{

}

function physicsUpdate(dt)
{

}

// #endregion

function renderBalls()
{

}

function update()
{
    const t = Date.now()
    const dt = min(dtCap, (t-lastTimeStamp)/1000)
    lastTimeStamp = t

    for (let i = 0; i < updatesPerTick; i++)
    {
        physicsUpdate(dt/updatesPerTick)
    }
    renderBalls()
    requestAnimationFrame(update)
}

update()