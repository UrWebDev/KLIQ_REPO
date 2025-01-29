import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env"; // Make sure your `.env` file is configured

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const uniqueId = await AsyncStorage.getItem("uniqueId");
        if (!uniqueId) {
          setError("Unique ID not found");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/profiles`, {
          params: { uniqueId },
        });

        setProfile(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>;
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
        Profile
      </Text>
      {profile && (
        <View>
          <Text style={{ fontSize: 18 }}>Name: {profile.name}</Text>
          <Text style={{ fontSize: 18 }}>Age: {profile.age}</Text>
          {profile.bloodType && (
            <Text style={{ fontSize: 18 }}>Blood Type: {profile.bloodType}</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default Profile;
