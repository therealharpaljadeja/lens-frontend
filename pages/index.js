import Head from "next/head";
import {
	Heading,
	Button,
	VStack,
	Tag,
	Input,
	HStack,
	Box,
	Icon,
	Text,
	Checkbox,
	FormControl,
	FormLabel,
	Image,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { AiOutlineCamera } from "react-icons/ai";
import { Contract, providers } from "ethers";
import { NFTStorage, File } from "nft.storage";
import MockProfileCreationProxy from "../abi/MockProfileCreationProxy.json";

const token = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY;
const client = new NFTStorage({ token });

export default function Home() {
	const [isMetamaskInstalled, setIsMetamaskInstalled] = useState(false);
	const [account, setAccount] = useState(null);
	const [provider, setProvider] = useState(null);
	const [handle, setHandle] = useState("");
	const [signer, setSigner] = useState(null);
	const [profileNFTImageURI, setProfileNFTImageURI] = useState(null);
	const [followNFTImageURI, setFollowNFTImageURI] = useState(null);
	const [profileNFTURI, setProfileNFTURI] = useState(null);
	const [followNFTURI, setFollowNFTURI] = useState(null);

	useEffect(() => {
		if (window.ethereum !== undefined) {
			setIsMetamaskInstalled(true);
		}
	}, []);

	async function connectWallet() {
		if (window.ethereum) {
			window.ethereum
				.request({
					method: "eth_requestAccounts",
				})
				.then((accounts) => {
					const newProvider = new providers.Web3Provider(
						window.ethereum
					);
					setProvider(newProvider);
					setAccount(accounts[0]);
				})
				.catch((error) => {
					console.log(error);
				});
		}
	}

	async function createProfile() {
		let LensHub = new Contract(
			"0x08C4fdC3BfF03ce4E284FBFE61ba820c23722540",
			MockProfileCreationProxy,
			provider.getSigner()
		);

		console.log(account, handle, profileNFTURI, followNFTURI);
		LensHub.proxyCreateProfile([
			account,
			handle,
			profileNFTURI,
			"0x0000000000000000000000000000000000000000",
			[],
			followNFTURI,
		])
			.then((message) => {
				console.log(message);
			})
			.catch((error) => {
				console.log(error);
			});
	}

	function handleInput(e, setter) {
		let { target } = e;
		setter(target.value);
	}

	function handleImageInput(e, setterURI, setterImageURI) {
		let { target } = e;
		const reader = new window.FileReader();
		reader.readAsArrayBuffer(target.files[0]);
		reader.onloadend = async () => {
			let imageData = Buffer(reader.result);
			let fileObj = new File([imageData], target.files[0].name, {
				type: "image/*",
			});

			let metadata = await client.store({
				name: handle,
				description: "lens nft",
				image: fileObj,
			});

			console.log(metadata);
			setterURI(metadata.url);
			setterImageURI(
				`https://ipfs.io/ipfs/${metadata.data.image.hostname}${metadata.data.image.pathname}`
			);
		};
	}

	return (
		<div>
			<Head>
				<title>Lens Frontend</title>
				<meta
					name="description"
					content="Generate Profiles using Lens Protocol"
				/>
				{/* <link rel="icon" href="/favicon.ico" /> */}
			</Head>

			<VStack
				justifyContent="center"
				alignItems="center"
				width="100vw"
				height="100vh"
				spacing={5}
			>
				<Heading>Create Profile using Lens Protocol</Heading>
				{isMetamaskInstalled && account === null ? (
					<Button onClick={connectWallet}>Connect Wallet</Button>
				) : null}
				{account !== null ? (
					<VStack width="500px">
						<HStack width="100%">
							<VStack width="100%">
								<Heading size="md">Profile Image</Heading>
								<FormControl>
									<FormLabel>
										<VStack width="100%" height="200px">
											{profileNFTImageURI !== null ? (
												<Image
													height="200px"
													borderRadius="10px"
													src={profileNFTImageURI}
												/>
											) : (
												<VStack
													background="green.200"
													borderRadius="10px"
													height="100%"
													width="100%"
													alignContent="center"
													justifyContent="center"
												>
													<Icon
														as={AiOutlineCamera}
													/>
													<Text>Upload Image</Text>
												</VStack>
											)}
										</VStack>
									</FormLabel>
									<Input
										onChange={(e) =>
											handleImageInput(
												e,
												setProfileNFTURI,
												setProfileNFTImageURI
											)
										}
										display="none"
										type="file"
										accept="image/*"
									/>
								</FormControl>
							</VStack>
							<VStack width="100%">
								<Heading size="md">Follow NFT Image</Heading>
								<FormControl>
									<FormLabel>
										<VStack width="100%" height="200px">
											{followNFTImageURI !== null ? (
												<Image
													height="200px"
													borderRadius="10px"
													src={followNFTImageURI}
												/>
											) : (
												<VStack
													height="100%"
													width="100%"
													background="green.200"
													borderRadius="10px"
													alignContent="center"
													justifyContent="center"
												>
													<Icon
														as={AiOutlineCamera}
													/>
													<Text>Upload Image</Text>
												</VStack>
											)}
										</VStack>
									</FormLabel>
									<Input
										onChange={(e) =>
											handleImageInput(
												e,
												setFollowNFTURI,
												setFollowNFTImageURI
											)
										}
										display="none"
										type="file"
										accept="image/*"
									/>
								</FormControl>
							</VStack>
						</HStack>
						<Tag>{account}</Tag>
						<Input
							value={handle}
							onChange={(e) => handleInput(e, setHandle)}
							placeholder="handle"
						/>

						<Button onClick={createProfile}>Mint Profile</Button>
					</VStack>
				) : null}
			</VStack>
		</div>
	);
}
