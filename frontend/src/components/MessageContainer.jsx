import {
  Avatar,
  Divider,
  Flex,
  Skeleton,
  SkeletonCircle,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { useRecoilState } from "recoil";
import { selectedConversationAttoms } from "../atoms/messagesAtom";
import useShowToast from "../hooks/useShowToast";

const MessageContainer = () => {
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAttoms
  );

  const [loading, setLaodingMessages] = true;
  const [messages, setMessages] = useState([]);

  const showToast = useShowToast();

  useEffect(() => {
    const getMessages = async () => {
      try {
        setLaodingMessages(true);
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
  }, [showToast, selectedConversation.userId]);

  return (
    <Flex
      flex={70}
      //   bg={useColorModeValue("gray.600", "gray.dark")}
      borderRadius={"md"}
      flexDirection={"column"}
      p={2}
    >
      {/* Message Container */}

      <Flex w={"full"} h={12} alignItems={"center"} gap={2}>
        <Avatar src={selectedConversation.userProfilePic} size={"sm"} />
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
        my={4}
        p={2}
        height={"300px"}
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
        <Message ownMessage={true} />
        <Message ownMessage={false} />
        <Message ownMessage={true} />
        <Message ownMessage={false} />
        <Message ownMessage={true} />
      </Flex>

      <MessageInput />
    </Flex>
  );
};

export default MessageContainer;
