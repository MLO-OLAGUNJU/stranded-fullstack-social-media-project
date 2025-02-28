import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  Avatar,
  Center,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { useRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import usePreviewImg from "../hooks/usePreviewImg";
import FreezeAccount from "../components/FreezeAccount";

export default function UpdateProfilePage() {
  const showToast = useShowToast();
  const [user, setUser] = useRecoilState(userAtom);
  const [inputs, setInputs] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    password: "",
    profilePic: user.profilePic,
    bio: user.bio,
  });
  const [updating, setUpdating] = useState(false);

  const fileRef = useRef(null);

  const { handleImageChange, imgUrl } = usePreviewImg();

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (updating) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/users/update/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...inputs, profilePic: imgUrl }),
      });

      const data = await res.json();

      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      showToast("Success", "Profile updated sucessfully", "success");
      setUser(data);
      localStorage.setItem("user-relate", JSON.stringify(data));
    } catch (error) {
      showToast("Error", error.message, "error"); // Use error.message
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <form onSubmit={handleUpdateProfile}>
        <Flex
          align={"center"}
          justify={"center"}
          // bg={useColorModeValue("gray.50", "gray.800")}
        >
          <Stack
            spacing={4}
            w={"full"}
            maxW={"md"}
            bg={useColorModeValue("white", "gray.dark")}
            rounded={"xl"}
            boxShadow={"lg"}
            p={6}
            mb={2}
          >
            <Heading lineHeight={1.1} fontSize={{ base: "2xl", sm: "3xl" }}>
              Update User Profile
            </Heading>
            <FormControl>
              <Stack direction={["column", "row"]} spacing={6}>
                <Center>
                  <Avatar
                    border={useColorModeValue(
                      "1px solid white",
                      "1px solid black"
                    )}
                    size="xl"
                    src={imgUrl || user.profilePic}
                  />
                </Center>
                <Center w="full">
                  <Center w="full">
                    <Button w="full" onClick={() => fileRef.current.click()}>
                      Change Avatar
                    </Button>
                    <Input
                      type="file"
                      hidden
                      ref={fileRef}
                      onChange={handleImageChange}
                    />
                  </Center>
                </Center>
              </Stack>
            </FormControl>
            <FormControl>
              <FormLabel>Full name</FormLabel>
              <Input
                outline={useColorModeValue("gray.600", "gray.700")}
                placeholder="Emmanuel Olagunju"
                _placeholder={{ color: "gray.500" }}
                type="text"
                onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                value={inputs.name}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Username</FormLabel>
              <Input
                outline={useColorModeValue("gray.600", "gray.700")}
                placeholder="mlo_olagunju"
                _placeholder={{ color: "gray.500" }}
                type="text"
                onChange={(e) =>
                  setInputs({ ...inputs, username: e.target.value })
                }
                value={inputs.username}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Email address</FormLabel>
              <Input
                outline={useColorModeValue("gray.600", "gray.700")}
                placeholder="mlo@mlo.com"
                _placeholder={{ color: "gray.500" }}
                type="email"
                onChange={(e) =>
                  setInputs({ ...inputs, email: e.target.value })
                }
                value={inputs.email}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Bio</FormLabel>
              <Input
                outline={useColorModeValue("gray.600", "gray.700")}
                placeholder="Your bio"
                _placeholder={{ color: "gray.500" }}
                type="text"
                onChange={(e) => setInputs({ ...inputs, bio: e.target.value })}
                value={inputs.bio}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                outline={useColorModeValue("gray.600", "gray.700")}
                placeholder="password"
                _placeholder={{ color: "gray.500" }}
                type="password"
                onChange={(e) =>
                  setInputs({ ...inputs, password: e.target.value })
                }
                value={inputs.password}
              />
            </FormControl>
            <Stack spacing={6} direction={["column", "row"]}>
              <Button
                bg={"red.400"}
                color={"white"}
                w="full"
                _hover={{
                  bg: "red.500",
                }}
              >
                Cancel
              </Button>
              <Button
                bg={useColorModeValue("gray.600", "gray.700")}
                color={"white"}
                w="full"
                _hover={{
                  bg: useColorModeValue("gray.700", "gray.800"),
                }}
                type="submit"
                isLoading={updating}
              >
                Submit
              </Button>
            </Stack>
          </Stack>
        </Flex>
      </form>
      <FreezeAccount />
    </>
  );
}
