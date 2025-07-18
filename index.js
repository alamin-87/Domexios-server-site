const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
const stripe = require("stripe")(process.env.PAYMENT_GATEWAY_KEY);
const admin = require("firebase-admin");

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

const serviceAccount = require("./firebase-admin-key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.umfqodo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("domexis");
    const userCollection = db.collection("users");
    const couponsCollection = db.collection("coupons");
    const apartmentCollection = db.collection("apartment");
    const agreementsCollection = db.collection("agreements");
    const paymentHistoryCollection = db.collection("payments");
    const announcementsCollection = db.collection("announcements");
    // verify token
    const verifyBToken = async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization; // lowercase
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res
            .status(401)
            .json({ message: "Unauthorized access: No token provided" });
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
          return res
            .status(401)
            .json({ message: "Unauthorized access: Token malformed" });
        }
        const decoded = await admin.auth().verifyIdToken(token);
        req.decoded = decoded; // store decoded token info for downstream
        next();
      } catch (error) {
        console.error("Token verification error:", error);
        return res
          .status(403)
          .json({ message: "Forbidden access: Invalid or expired token" });
      }
    };
    // verify admin
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      if (!user || user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Forbidden access: Invalid or expired token" });
      }
      next();
    };

    // Users API
    app.get("/users", async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    app.get("/users/:email", async (req, res) => {
      const { email } = req.params;
      const user = await userCollection.findOne({ email });
      res.send(user);
    });

    app.get("/users/:email/role", async (req, res) => {
      const email = req.params.email;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      try {
        const user = await userCollection.findOne({ email });
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        // Always return an object with `role` key
        res.status(200).json({ role: user.role || "user" });
      } catch (error) {
        console.error("Error fetching user role:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.post("/users", async (req, res) => {
      const email = req.body.email;
      const existingUser = await userCollection.findOne({ email });
      if (existingUser) {
        return res
          .status(200)
          .json({ message: "User already exists", user: existingUser });
      }
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    // Assuming Express.js
    app.patch("/users/:id/remove-member", verifyBToken, verifyAdmin, async (req, res) => {
      const userId = req.params.id;

      try {
        const result = await userCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $set: { role: "user" } }
        );

        res.send(result);
      } catch (error) {
        console.error("Error removing member role:", error);
        res.status(500).send({ error: "Failed to remove role" });
      }
    });

    // Coupons API
    // Routes
    app.get("/coupons", async (req, res) => {
      const coupons = await couponsCollection.find().toArray();
      res.send(coupons);
    });
    // POST new coupon
    app.post("/coupons", async (req, res) => {
      const {
        title,
        description,
        code,
        validTill,
        type,
        status,
        discount,
        discountType,
        created_at,
      } = req.body;

      const newCoupon = {
        title,
        description,
        code,
        validTill,
        type,
        status,
        discount: Number(discount),
        discountType,
        created_at: created_at || new Date().toISOString(),
      };

      const result = await couponsCollection.insertOne(newCoupon);
      res.send(result);
    });

    app.put("/coupons/:id", verifyBToken,verifyAdmin, async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;

      const result = await couponsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      res.send(result);
    });

    app.delete("/coupons/:id",verifyAdmin, async (req, res) => {
      const { id } = req.params;
      const result = await couponsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });
    // Apartment API
    app.get("/apartment", async (req, res) => {
      const apartments = await apartmentCollection.find().toArray();
      res.send(apartments);
    });

    app.patch("/apartment/:apartmentNo", async (req, res) => {
      const apartmentNo = req.params.apartmentNo;
      const { agreement } = req.body;
      const result = await apartmentCollection.updateOne(
        { apartmentNo },
        { $set: { agreement } }
      );
      res.send(result);
    });
    // Agreements API
    // Get all agreements or filter by userEmail
    app.get("/agreements", verifyBToken,verifyAdmin, async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) query = { userEmail: email };
      const result = await agreementsCollection.find(query).toArray();
      res.send(result);
    });
    // Get agreements by user email
    app.get("/agreements/user/:email", verifyBToken,verifyAdmin, async (req, res) => {
      const email = req.params.email;
      const agreements = await agreementsCollection
        .find({ userEmail: email })
        .toArray();
      res.send(agreements);
    });
    // Get pending agreements by user email
    app.get(
      "/agreements/user/:email/pending",
      verifyBToken,verifyAdmin,
      async (req, res) => {
        const email = req.params.email;
        const agreements = await agreementsCollection
          .find({ userEmail: email, status: "pending" })
          .toArray();
        res.send(agreements);
      }
    );
    app.get("/agreements/requested", verifyBToken,verifyAdmin, async (req, res) => {
      const agreements = await agreementsCollection
        .find({ agreement: "requested" })
        .toArray();
      res.send(agreements);
    });
    app.get(
      "/agreements/user/:email/checked",
      verifyBToken, verifyAdmin,
      async (req, res) => {
        const email = req.params.email;
        const agreements = await agreementsCollection
          .find({ userEmail: email, agreement: "checked", status: "pending" })
          .toArray();
        res.send(agreements);
      }
    );
    // Create agreement
    app.post("/agreements", verifyBToken,verifyAdmin, async (req, res) => {
      const agreement = req.body;
      // Check if apartment already agreed
      const exists = await agreementsCollection.findOne({
        apartmentNo: agreement.apartmentNo,
      });
      if (exists) {
        return res
          .status(409)
          .send({ message: "Already agreed by someone else." });
      }
      const result = await agreementsCollection.insertOne(agreement);
      // Update apartment agreement status to done
      await apartmentCollection.updateOne(
        { apartmentNo: agreement.apartmentNo },
        { $set: { agreement: "done" } }
      );
      res.send(result);
    });
    app.patch("/agreements/:id",verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const { agreement } = req.body;
      const result = await agreementsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { agreement } }
      );
      res.send(result);
    });

    // Delete agreement by ID
    app.delete("/agreements/:id",verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const result = await agreementsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // Payments API
    app.get("/payments", verifyBToken, async (req, res) => {
      const payments = await paymentHistoryCollection.find().toArray();
      res.send(payments);
    });
    // server/routes/paymentRoutes.js
    app.get("/payments/user/:email", verifyBToken, async (req, res) => {
      const email = req.params.email;
      const payments = await db
        .collection("payments")
        .find({ userEmail: email })
        .toArray();
      res.send(payments);
    });

    app.post("/payments/complete", async (req, res) => {
      const { agreementId, userEmail, couponCode, discount } = req.body;
      try {
        const agreement = await agreementsCollection.findOne({
          _id: new ObjectId(agreementId),
        });
        if (!agreement)
          return res.status(404).send({ error: "Agreement not found" });
        // Save payment history
        const paymentInfo = {
          userEmail,
          userName: agreement.userName,
          apartmentNo: agreement.apartmentNo,
          floorNo: agreement.floorNo,
          blockName: agreement.blockName,
          rent: agreement.rent,
          discount,
          paidAmount: agreement.rent - discount,
          status: "paid",
          paidAt: new Date(),
          couponCode: couponCode || null,
        };
        await paymentHistoryCollection.insertOne(paymentInfo);
        // Update agreement status
        await agreementsCollection.updateOne(
          { _id: new ObjectId(agreementId) },
          { $set: { status: "paid" } }
        );
        // Update user role to member
        await userCollection.updateOne(
          { email: userEmail },
          { $set: { role: "member" } }
        );
        res.send({ message: "Payment completed successfully" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Payment finalization failed" });
      }
    });
    // announcements api
    app.get("/announcements", verifyBToken, async (req, res) => {
      const coupons = await announcementsCollection.find().toArray();
      res.send(coupons);
    });
    app.post("/announcements", verifyAdmin, async (req, res) => {
      const announcement = req.body;

      try {
        const result = await db
          .collection("announcements")
          .insertOne(announcement);
        res.send(result);
      } catch (error) {
        console.error("Error inserting announcement:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });
    // PUT update announcement
    app.put("/announcements/:id",verifyAdmin, async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;

      const result = await announcementsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      res.send(result);
    });

    // DELETE announcement
    app.delete("/announcements/:id",verifyAdmin, async (req, res) => {
      const { id } = req.params;
      const result = await announcementsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // Stripe Payment Intent
    app.post("/create-payment-intent", verifyBToken, async (req, res) => {
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // cents
          currency: "usd",
          payment_method_types: ["card"],
        });
        res.send({ clientSecret: paymentIntent.client_secret });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Payment intent creation failed" });
      }
    });

    // Ping
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. Connected to MongoDB!");
  } finally {
    // Not closing client here so server stays connected
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Domexis start!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
