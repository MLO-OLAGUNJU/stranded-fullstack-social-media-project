import {
  Avatar,
  Divider,
  Flex,
  Skeleton,
  SkeletonCircle,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  conversationAtom,
  selectedConversationAttoms,
} from "../atoms/messagesAtom";
import useShowToast from "../hooks/useShowToast";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../context/SocketContext";
import messageSound from "../assets/sounds/message.mp3";

const MessageContainer = () => {
  const selectedConversation = useRecoilValue(selectedConversationAttoms);
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const currentUser = useRecoilValue(userAtom);

  const [loading, setLaodingMessages] = useState(true);
  const [messages, setMessages] = useState([]);

  const showToast = useShowToast();
  const setConversations = useSetRecoilState(conversationAtom);

  const { socket } = useSocket();

  useEffect(() => {
    socket.on("newMessage", (message) => {
      if (selectedConversation._id === message.conversationId) {
        setMessages((prev) => [...prev, message]);
      }

      if (!document.hasFocus()) {
        const sound = new Audio(messageSound);
        sound.play();
      }

      setConversations((prev) => {
        const updatedConversations = prev.map((conversation) => {
          if (conversation._id === message.conversationId) {
            return {
              ...conversation,
              lastMessage: {
                text: message.text,
                sender: message.sender,
              },
            };
          }
          return conversation;
        });
        return updatedConversations;
      });

      scrollToBottom();
    });

    return () => socket.off("newMessage");
  }, [socket, selectedConversation, setConversations]);

  useEffect(() => {
    const lastMessageIsFromOtherUser =
      messages.length &&
      messages[messages.length - 1].sender !== currentUser._id;
    if (lastMessageIsFromOtherUser) {
      socket.emit("markMessagesAsSeen", {
        conversationId: selectedConversation._id,
        userId: selectedConversation.userId,
      });
    }

    socket.on("messagesSeen", ({ conversationId }) => {
      if (selectedConversation._id === conversationId) {
        setMessages((prev) => {
          const updatedMessages = prev.map((message) => {
            if (!message.seen) {
              return {
                ...message,
                seen: true,
              };
            }
            return message;
          });
          return updatedMessages;
        });
      }
    });
  }, [socket, currentUser._id, messages, selectedConversation]);

  useEffect(() => {
    const getMessages = async () => {
      setLaodingMessages(true);
      setMessages([]);
      try {
        if (selectedConversation.mock) return;

        const res = await fetch(`api/messages/${selectedConversation.userId}`);

        const data = await res.json();
        setMessages(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLaodingMessages(false);
      }
    };

    getMessages();
  }, [showToast, selectedConversation.userId, selectedConversation.mock]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <Flex
      flex={70}
      //   bg={useColorModeValue("gray.600", "gray.dark")}
      borderRadius={"md"}
      flexDirection={"column"}
      p={{ base: 0, md: 2 }}
    >
      {/* Message Container */}

      <Flex
        w={"full"}
        h={12}
        alignItems={"center"}
        gap={2}
        display={{
          base: "none",
          md: "flex",
        }}
      >
        <Avatar
          name={selectedConversation.username}
          src={selectedConversation.userProfilePic}
          size={"sm"}
        />
        <Text fontWeight={"700"} display={"flex"} alignItems={"center"}>
          {selectedConversation.username}
          {selectedConversation.isVerified === true && (
            <RiVerifiedBadgeFill
              className={`ml-1 ${
                selectedConversation.isCEO ? "text-[#8fbd1a]" : "text-sky-600"
              }`}
            />
          )}
        </Text>
      </Flex>

      <Divider />

      {/* Message */}
      <Flex
        flexDir={"column"}
        gap={4}
        my={{
          base: 0,
          md: 4,
        }}
        p={2}
        height={{
          base: "79vh",
          md: "300px",
        }}
        overflowY={"auto"}
      >
        {loading &&
          [...Array(5)].map((_, i) => (
            <Flex
              key={i}
              gap={2}
              alignItems={"center"}
              p={1}
              borderRadius={"md"}
              alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"}
            >
              {i % 2 === 0 && <SkeletonCircle size={7} />}
              <Flex flexDir={"column"} gap={2}>
                <Skeleton h={"8px"} w={"250px"} />
                <Skeleton h={"8px"} w={"250px"} />
                <Skeleton h={"8px"} w={"250px"} />
              </Flex>
              {i % 2 !== 0 && <SkeletonCircle size={7} />}
            </Flex>
          ))}

        {!loading &&
          messages.map((message) => (
            <Message
              key={message._id}
              ownMessage={message.sender === currentUser._id}
              message={message}
            />
          ))}
        <div ref={messagesEndRef} />
      </Flex>

      {/* Invisible div to scroll to */}
      <MessageInput setMessages={setMessages} />
    </Flex>
  );
};

export default MessageContainer;
