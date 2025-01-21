import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"; // For password hashing
import { SigninSchema, SignupSchema } from "../types"; // Zod schemas
import db from "@repo/db/index";
import { JWT_PASSWORD } from "../config";
import { authMiddleware } from "../middleware";

const router = Router();
const SALT_ROUNDS = 10;

// // Route: Sign up
// router.post("/signup", async (req: Request, res: Response) => {
//   const parsedData = SignupSchema.safeParse(req.body);

//   if (!parsedData.success) {
//     console.log(parsedData.error);
//     return res.status(411).json({ message: "Incorrect inputs" });
//   }

//   const userExists = await db.user.findFirst({
//     where: { email: parsedData.data.username },
//   });

//   if (userExists) {
//     return res.status(403).json({ message: "User already exists" });
//   }

//   // Hash the password before storing it
//   const hashedPassword = await bcrypt.hash(parsedData.data.password, SALT_ROUNDS);

//   await db.user.create({
//     data: {
//       email: parsedData.data.username,
//       password: hashedPassword,
//       name: parsedData.data.name,
//     },
//   });

//   return res.json({ message: "Please verify your account by checking your email" });
// });

// // Route: Sign in
// router.post("/signin", async (req: Request, res: Response) => {
//     const parsedData = SigninSchema.safeParse(req.body);
  
//     if (!parsedData.success) {
//       return res.status(411).json({ message: "Incorrect inputs" });
//     }
  
//     const user = await db.user.findFirst({
//       where: { email: parsedData.data.username },
//     });
  
//     if (!user || !user.password) {  // Check if user exists and has a password
//       return res.status(403).json({ message: "Invalid credentials" });
//     }
  
//     // Compare hashed password
//     const isPasswordCorrect = await bcrypt.compare(parsedData.data.password, user.password);
//     if (!isPasswordCorrect) {
//       return res.status(403).json({ message: "Invalid credentials" });
//     }
  
//     // Sign the JWT
//     const token = jwt.sign({ id: user.id }, JWT_PASSWORD, { expiresIn: "1h" });
  
//     res.json({ token });
//   });


// // Route: Google sign-in

router.post("/google-login", async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ message: "Email and name are required" });
  }

  try {
    let user = await db.user.findFirst({ where: { email } });

    if (!user) {
      user = await db.user.create({
        data: {
          email,
          name,
          authProvider: "google",
          password: null, // No password required for Google-authenticated users
        },
      });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_PASSWORD,
      { expiresIn: "1h" }
    );

    res.json({ id: user.id, email: user.email, name: user.name, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// // For googleAuthRoute----------------end



// router.get("/", authMiddleware, async (req, res) => {
//     // TODO: Fix the type
//     // @ts-ignore
//     const id = req.id;
//     const user = await db.user.findFirst({
//         where: {
//             id
//         },
//         select: {
//             name: true,
//             email: true
//         }
//     });

//     return res.json({
//         user
//     });
// })

// export const userRouter = router;





// import { Router } from "express";
// import { authMiddleware } from "../middleware";
// import { SigninSchema, SignupSchema } from "../types";
// import { db } from "../db";
// import jwt from "jsonwebtoken";
// import { JWT_PASSWORD } from "../config";



router.post("/signup", async (req, res) => {
    const body = req.body;
    const parsedData = SignupSchema.safeParse(body);

    if (!parsedData.success) {
        console.log(parsedData.error);
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const userExists = await db.user.findFirst({
        where: {
            email: parsedData.data.username
        }
    });

    if (userExists) {
        return res.status(403).json({
            message: "User already exists"
        })
    }

    await db.user.create({
        data: {
            email: parsedData.data.username,
            // TODO: Dont store passwords in plaintext, hash it
            password: parsedData.data.password,
            name: parsedData.data.name
        }
    })

    // await sendEmail();

    return res.json({
        message: "Please verify your account by checking your email"
    });

})

router.post("/signin", async (req, res) => {
    const body = req.body;
    const parsedData = SigninSchema.safeParse(body);

    if (!parsedData.success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const user = await db.user.findFirst({
        where: {
            email: parsedData.data.username,
            password: parsedData.data.password
        }
    });
    
    if (!user) {
        return res.status(403).json({
            message: "Sorry credentials are incorrect"
        })
    }

    // sign the jwt
    const token = jwt.sign({
        id: user.id
    }, JWT_PASSWORD);

    res.json({
        token: token,
    });
})

router.get("/", authMiddleware, async (req, res) => {
    // TODO: Fix the type
    // @ts-ignore
    const id = req.id;
    const user = await db.user.findFirst({
        where: {
            id
        },
        select: {
            name: true,
            email: true
        }
    });

    return res.json({
        user
    });
})

export const userRouter = router;