import {
  Client,
  ID,
  Account,
  Avatars,
  Databases,
  Query,
  Storage,
} from "react-native-appwrite";

export const Config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.nexus.aora",
  projectId: "6720f08b001d3293d13b",
  databaseId: "6720f1e0003d3bf4fdc6",
  userColId: "6720f1fc000b2bc2011f",
  videoColId: "6720f2190025c669824c",
  storageId: "6720f38700293ec6960a",
};

const client = new Client();

client
  .setEndpoint(Config.endpoint)
  .setProject(Config.projectId)
  .setPlatform(Config.platform);

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// Register user
export async function createUser(email, password, username) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw new Error("Failed to create account");

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      Config.databaseId,
      Config.userColId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
        likedVideos: [], // Initialize likedVideos
      }
    );

    return newUser;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Sign In
export async function signIn(email, password) {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get Account
export async function getAccount() {
  try {
    const currentAccount = await account.get();
    return currentAccount;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get Current User
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw new Error("No current account found");

    const currentUser = await databases.listDocuments(
      Config.databaseId,
      Config.userColId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser.documents.length) throw new Error("No user found");

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Sign Out
export async function signOut() {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Upload File
export async function uploadFile(file, type) {
  if (!file) return;

  const { mimeType, ...rest } = file;
  const asset = { type: mimeType, ...rest };

  try {
    const uploadedFile = await storage.createFile(
      Config.storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);
    return fileUrl;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get File Preview
export async function getFilePreview(fileId, type) {
  let fileUrl;

  try {
    if (type === "video") {
      fileUrl = storage.getFileView(Config.storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        Config.storageId,
        fileId,
        2000,
        2000,
        "top",
        100
      );
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw new Error("File URL not found");

    return fileUrl;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Create Video Post
export async function createVideoPost(form) {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    const newPost = await databases.createDocument(
      Config.databaseId,
      Config.videoColId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        users: form.userId,
        likedBy: [], // Initialize likedBy array
      }
    );

    return newPost;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get all video Posts
export async function getAllPosts() {
  try {
    const posts = await databases.listDocuments(
      Config.databaseId,
      Config.videoColId,
      [Query.orderDesc("$createdAt")]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get video posts that match search query
export async function searchPosts(query) {
  try {
    const posts = await databases.listDocuments(
      Config.databaseId,
      Config.videoColId,
      [Query.search("title", query), Query.orderDesc("$createdAt")]
    );

    if (!posts) throw new Error("Something went wrong");

    return posts.documents;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get latest created video posts
export async function getLatestPosts() {
  try {
    const posts = await databases.listDocuments(
      Config.databaseId,
      Config.videoColId,
      [Query.orderDesc("$createdAt"), Query.limit(7)]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Change Avatar
export async function changeAvatar(file) {
  if (!file) throw new Error("No file selected");

  try {
    const uploadedAvatar = await uploadFile(file, "image");
    const currentAccount = await getAccount();
    const currentUser = await getCurrentUser();

    if (!currentUser) throw new Error("User document not found");

    const updatedUser = await databases.updateDocument(
      Config.databaseId,
      Config.userColId,
      currentUser.$id,
      {
        avatar: uploadedAvatar,
      }
    );

    return updatedUser;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Update User Likes
export async function updateUserLikes(userId, videoId, isLiked) {
  try {
    const userDocument = await databases.getDocument(Config.databaseId, Config.userColId, userId);

    let likedVideos = userDocument.likedVideos || [];

    if (!isLiked) {

      if (!likedVideos.includes(videoId)) {
        likedVideos.push(videoId); 

        await databases.updateDocument(
          Config.databaseId,
          Config.userColId,
          userId,
          { likedVideos }
        );
      }
    } else {

      var index=0;
      var len = likedVideos.length;

      while(len--) {
        if(likedVideos[index].$id === videoId) break;
        else index++;
      }

      if (index > -1) {
        likedVideos.splice(index, 1);

        await databases.updateDocument(
          Config.databaseId,
          Config.userColId,
          userId,
          { likedVideos }
        );
      }
    }
  } catch (error) {
    console.error('Error updating likedVideos:', error);
  }
}

// Get video posts liked by user
export async function getUserLikedPosts(userId) {
  try {
    const userDocument = await databases.getDocument(Config.databaseId, Config.userColId, userId);
    const likedVideos = userDocument.likedVideos || [];

    if (likedVideos.length === 0) return []; 

    const posts = await databases.listDocuments(
      Config.databaseId,
      Config.videoColId,
      [Query.equal('$id', likedVideos)]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Delete Video Post
export async function deleteVideoPost(videoId) {
  try {
    await databases.deleteDocument(Config.databaseId, Config.videoColId, videoId);
  } catch (error) {
    throw new Error(error.message);
  }
}
