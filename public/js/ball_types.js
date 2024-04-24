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

const sqrt = Math.sqrt

const startingRadius = .03
let size = startingRadius
ballTypes.map((ball, i) => {
    ball.size = size
    size = sqrt(size*size*1.75)
})

export default ballTypes