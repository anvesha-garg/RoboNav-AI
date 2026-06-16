# 🤖 RoboNav AI – Autonomous Robot Path Planning Simulator

RoboNav AI is an interactive robotics simulation platform that demonstrates autonomous robot navigation using the **A* (A-Star) Path Planning Algorithm**. The simulator allows users to define start and goal positions, place obstacles, and visualize how a robot computes the shortest collision-free path in a grid-based environment.

This project showcases fundamental robotics concepts such as path planning, obstacle avoidance, autonomous navigation, and heuristic search.

---

## 🌐 Live Demo

**Demo:** https://anvesha-garg.github.io/RoboNav-AI/

**Repository:** https://github.com/anvesha-garg/RoboNav-AI

---

## 📖 Overview

Autonomous robots must efficiently navigate from one location to another while avoiding obstacles. RoboNav AI simulates this navigation process using the A* search algorithm, one of the most widely used path-planning techniques in robotics and artificial intelligence.

Users can interact with the grid environment, create custom scenarios, and observe how the algorithm explores nodes and determines the optimal path.

---

## ✨ Features

* Interactive grid-based environment
* Set custom Start and Goal positions
* Add and remove obstacles dynamically
* A* path planning algorithm
* Visual representation of explored nodes
* Shortest path visualization
* Path length statistics
* Responsive academic-style interface
* Browser-based simulation with no installation required

---

## 🧠 Robotics Concepts Demonstrated

### Path Planning

Determining the optimal route between two points while minimizing travel cost.

### Obstacle Avoidance

Navigating safely around blocked regions of the environment.

### Autonomous Navigation

Simulating decision-making processes used by mobile robots.

### Heuristic Search

Using intelligent search strategies to reduce computational complexity.

---

## ⚙️ Algorithm Used

### A* (A-Star) Search Algorithm

The simulator uses the A* algorithm to compute the shortest path between the start and goal nodes.

**Evaluation Function:**

```text
f(n) = g(n) + h(n)
```

Where:

* **g(n)** = Cost from the start node to the current node
* **h(n)** = Estimated cost from the current node to the goal node
* **f(n)** = Total estimated path cost

The heuristic used is **Manhattan Distance**, making the algorithm efficient for grid-based navigation.

---

## 🛠️ Technology Stack

| Technology   | Purpose          |
| ------------ | ---------------- |
| HTML5        | Structure        |
| CSS3         | Styling          |
| JavaScript   | Simulation Logic |
| GitHub Pages | Deployment       |

---

## 📂 Project Structure

```text
RoboNav-AI/
│
├── index.html
├── script.js
├── styles.css
└── README.md
```

---

## 🚀 Running Locally

### Clone the Repository

```bash
git clone https://github.com/anvesha-garg/RoboNav-AI.git
```

### Navigate to the Project Directory

```bash
cd RoboNav-AI
```

### Launch the Application

Open `index.html` in your preferred web browser.

No additional dependencies are required.

---

## 🎯 Applications

* Mobile Robot Navigation
* Warehouse Automation Systems
* Autonomous Delivery Robots
* Search and Rescue Robotics
* Intelligent Transportation Systems
* Educational Robotics Simulations

---

## 🔄 Simulation Workflow

1. Select a Start Node
2. Select a Goal Node
3. Place Obstacles
4. Execute the A* Algorithm
5. Observe Node Exploration
6. Visualize the Optimal Path

---

## 🔮 Future Enhancements

* BFS vs A* Algorithm Comparison
* Dijkstra’s Algorithm Support
* Diagonal Movement
* Dynamic Obstacles
* Animated Robot Traversal
* ROS Integration
* Multi-Robot Navigation

---


## 📜 License

This project is developed for educational and academic purposes.

