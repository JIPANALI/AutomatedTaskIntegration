import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();

async function main() {
    await prismaClient.availableTrigger.create({
        data: {
            id: "webhook",
            name: "Webhook",
            image: "https://media.licdn.com/dms/image/D4D12AQHtrdLcx2NuzQ/article-cover_image-shrink_720_1280/0/1709325806317?e=2147483647&v=beta&t=WicCYxv1O9YcYvzPDzfcDgPwMlGofEkq00DGZDVTEAY"
        }
    })

    await prismaClient.availableAction.create({
        data:{
            id:"send-sol",
            name:"Solana",
            image:"https://pbs.twimg.com/profile_images/1472933274209107976/6u-LQfjG_400x400.jpg"
        }
    })
    await prismaClient.availableAction.create({
        data:{
            id:"email",
            name:"Email",
            image:"https://cdn-icons-png.flaticon.com/512/561/561127.png"
        }
    })
}
main();