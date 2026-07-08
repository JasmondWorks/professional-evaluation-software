import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

type reqInfo = {
   email: string
   password: string
};
 
const getUser = async (info: reqInfo) => {
   const {email, password} = info;
   const user = await prisma.pesuser.findMany({
      where: {
         email: email,
         password: password
      }
   });

   return user;
}
const getGoals = async () => await prisma.goals.findMany();
const getPerformance = async () => await prisma.performance.findMany();


export {
   getUser,
   getGoals,
   getPerformance
}