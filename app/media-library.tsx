import PictureView from "@/components/screens/camera/picture-view";
import { Image } from "expo-image";
import { Asset, getAlbumsAsync, getAssetsAsync } from "expo-media-library";
import React, { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";

export default function MediaLibrary() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [picture, setPicture] = React.useState<string>("");

  useEffect(() => {
    getAlbums();
  }, []);

  async function getAlbums() {
    const fetchAlbumns = await getAlbumsAsync();
    const albumAsset = await getAssetsAsync({
      // album: fetchAlbumns[0],
      mediaType: "photo",
      sortBy: "creationTime",
      first: 40,
    });
    setAssets(albumAsset.assets);
  }

  if (picture) return <PictureView picture={picture} setPicture={setPicture} />;
  return (
    <>
      <ScrollView
        contentContainerStyle={{
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {assets.map((photo) => (
          <TouchableOpacity
            key={photo.id}
            onPress={() => setPicture(photo.uri)}
            style={{
              width: "25%", 
              height: 100, 
            }}
          >
            <Image
              source={{ uri: photo.uri }}
              style={{
                width: "100%", 
                height: "100%",
              }}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
}
