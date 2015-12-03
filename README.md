# Understanding-Block

This project proposes a goal-oriented platform able to perform a set of task necessary to achieve the request expressed by user.

The proposed scenario is constituted by an intelligent environment in which they are immersed several smart objects.

This platform is a middleware between user and smart object. Users express their request in form of goal. The platform understand the request and coordinates the action of smart object.

The platform is made of serveral parts: Undertanding Block, Task Coordinator, Discovery Block, Target Block, SmartHome-Application-Client.

This module understand the request from application client and produce a json file. This file contains the request in form of trigger, action and elseAction. This file is forwarded to Task Coordinator.

It requires Node.js and Mongo DB installed.
Install the sistem with command npm install.
Start Task Coordinator and Discovery Block.
