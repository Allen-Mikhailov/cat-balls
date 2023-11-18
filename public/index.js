const min = Math.min

const ballContainer = document.getElementById("ball-container")

const balls = []
const updatesPerTick = 3
const dtCap = 1/10

const ballSizes = [.5, .10, .15, .20];

let lastTimeStamp = Date.now()

function randomColor()
{
    return `rgb(${Math.floor(Math.random()*256)}, ${Math.floor(Math.random()*256)}, ${Math.floor(Math.random()*256)})`
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}
  

const linearEase = (x) => {return x;}

function addLerp(ball, property, target, time, ease=linearEase)
{
    ball.lerps.push({
        property: property,
        initial: ball[property],
        target: target,
        start: Date.now(),
        end: Date.now()+time,
        ease: ease
    })

}

function createBall(posX=.5, posY=0, size=0)
{
    const ballObj = document.createElement("div")
    ballObj.className = "ball"
    ballObj.style.backgroundColor = randomColor()
    ballContainer.appendChild(ballObj)

    const ball = {
        obj: ballObj,
        x: posX,
        y: posY,
        r: .01,
        lerps: [],
        vx: 0,
        vy: 0
    }

    addLerp(ball, "r", ballSizes[size], .25)

    balls.push(ball)
} 

// #region Physics

function circleCollisions()
{
    const sBalls = shuffle(balls)
    sBalls.map((ball1, i1) => {
        sBalls.map((ball2, i2) => {
            if (i1 == i2) {return;}

            const distance = Math.sqrt(
                (ball1.x-ball2.x)*(ball1.x-ball2.x) + 
                (ball1.y-ball2.y)*(ball1.y-ball2.y)
                )

            if (distance < ball1.r-ball2.r)
            {
                // Colision
                
            }
        })
    })
}

function lineCollisions()
{
    
}

function handleLerps(dt)
{

}

function movementUpdate(dt)
{
    balls.map((ball) => {
        const ax = 0
        const ay = .1

        ball.x += ball.vx*dt + .5*ax*dt*dt
        ball.y += ball.vy*dt + .5*ay*dt*dt
    })
}

function physicsUpdate(dt)
{
    movementUpdate(dt)
    for (let i = 0; i < updatesPerTick; i++)
    {
        circleCollisions()
        lineCollisions()
    }
}

// #endregion

function renderBalls()
{
    balls.map((ball) => {
        ball.style.translate = `${(ball.x - ball.r/2) * 100}% ${(ball.y - ball.r/2) * 100}%`
        ball.style.width = `${ball.r * 100}%`
    })
}

function update()
{
    const t = Date.now()
    const dt = min(dtCap, (t-lastTimeStamp)/1000)
    lastTimeStamp = t

    physicsUpdate(dt)
    renderBalls()
    requestAnimationFrame(update)
}

createBall(.5, 0, 0)

update()