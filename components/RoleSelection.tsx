import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type Role = 'farmer' | 'department_official' ;

interface RoleOption {
  id: Role;
  icon: string;
  title: string;
  color: string;
  lightColor: string;
}

const roles: RoleOption[] = [
  { id: 'farmer',              icon: '🧑‍🌾', title: 'Farmer',              color: '#2D6A4F', lightColor: '#D8F3DC' },
  { id: 'department_official', icon: '🏛️', title: 'Department Official',  color: '#1A4971', lightColor: '#D6E8FA' },
  
];



const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fadeAnim  = useRef(new Animated.Value(1)).current;
//   const dispatch  = useDispatch();

  const handleSelect = (role: RoleOption) => {
    setSelectedRole(role);
    setDropdownOpen(false);
  };

const handleContinue = () => {
  if (!selectedRole) return;

  if (selectedRole.id === 'farmer') {
    router.push('/(tabs)/farmer/FarmerLogin');
    return;
  }

  if (selectedRole.id === 'department_official') {
    router.push('/(tabs)/department/DeptOfficialLogin');
    return;
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F9F1" />

      {/* ── HEADER IMAGE ── */}
      <View style={styles.headerImageWrapper}>
        <Image
          source={require('../assets/images/header-banner.png')}
          style={styles.headerImage}
          resizeMode="stretch"
        />
      </View>

      {/* ── TITLE ── */}
      <Animated.View style={[styles.titleSection, { opacity: fadeAnim }]}>
         <Text style={styles.subHeading}>Welcome to Department of Horticulture.</Text>
        <Text style={styles.subHeading}>Government of Haryana.</Text>
        <Animatable.Text
          style={styles.heading}
          animation="fadeIn"
          iterationCount="infinite"
          direction="alternate"
        >
          Please Select Your User Type
        </Animatable.Text>
       
      </Animated.View>

      {/* ── DROPDOWN ── */}
      <View style={styles.dropdownSection}>
        <Text style={styles.label}>Select Role</Text>

        {/* Trigger */}
        <TouchableOpacity
          style={[
            styles.dropdownTrigger,
            selectedRole && { borderColor: selectedRole.color, borderWidth: 2 },
          ]}
          activeOpacity={0.8}
          onPress={() => setDropdownOpen(true)}
        >
          {selectedRole ? (
            <View style={styles.selectedRow}>
              <View style={[styles.iconCircle, { backgroundColor: selectedRole.color }]}>
                <Text style={styles.roleIcon}>{selectedRole.icon}</Text>
              </View>
              <Text style={[styles.selectedText, { color: selectedRole.color }]}>
                {selectedRole.title}
              </Text>
            </View>
          ) : (
            <View style={styles.selectedRow}>
              <View style={[styles.iconCircle, { backgroundColor: '#E0EDE5' }]}>
                <Text style={styles.roleIcon}>👥</Text>
              </View>
              <Text style={styles.placeholderText}>-- Choose your role --</Text>
            </View>
          )}
          <Text style={styles.chevron}>{dropdownOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {/* ── MODAL DROPDOWN ── */}
        <Modal
          visible={dropdownOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setDropdownOpen(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setDropdownOpen(false)}
          >
            <View style={styles.dropdownList}>
              <Text style={styles.dropdownHeader}>Select Your Role</Text>
              <FlatList
                data={roles}
                keyExtractor={item => item.id}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item }) => {
                  const isSelected = selectedRole?.id === item.id;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.dropdownItem,
                        isSelected && { backgroundColor: item.lightColor },
                      ]}
                      onPress={() => handleSelect(item)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.iconCircle, { backgroundColor: isSelected ? item.color : item.lightColor }]}>
                        <Text style={styles.roleIcon}>{item.icon}</Text>
                      </View>
                      <Text style={[styles.dropdownItemText, isSelected && { color: item.color, fontWeight: '800' }]}>
                        {item.title}
                      </Text>
                      {isSelected && <Text style={[styles.checkMark, { color: item.color }]}>✓</Text>}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* ── SELECTED ROLE INFO CARD ── */}
        {selectedRole && (
          <Animatable.View
            animation="fadeInUp"
            duration={400}
            style={[styles.infoCard, { backgroundColor: selectedRole.lightColor, borderColor: selectedRole.color }]}
          >
            <Text style={[styles.infoCardTitle, { color: selectedRole.color }]}>
              {selectedRole.icon}  {selectedRole.title}
            </Text>
            <Text style={[styles.infoCardSub, { color: selectedRole.color }]}>
              {selectedRole.id === 'farmer'              && 'Manage crops, get care tips & track your farm'}
              {selectedRole.id === 'department_official' && 'Monitor schemes, reports & farmer data'}
             
            </Text>
          </Animatable.View>
        )}
      </View>

      {/* ── CONTINUE BUTTON ── */}
      <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            !selectedRole && styles.continueBtnDisabled,
            selectedRole && { backgroundColor: selectedRole.color },
          ]}
          activeOpacity={0.85}
          onPress={handleContinue}
          disabled={!selectedRole}
        >
          <Text style={styles.continueBtnText}>
            Continue →
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F9F1' },

  titleSection: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20 },

  heading: { fontSize: 22, fontWeight: '800', color: '#a81925', marginBottom: 6, textAlign: 'center' },

  subHeading: { fontSize: 15, color: '#52796F', textAlign: 'center' },

  dropdownSection: { flex: 1, paddingHorizontal: 24, paddingTop: 8 },

  label: { fontSize: 14, fontWeight: '700', color: '#1B4332', marginBottom: 8, letterSpacing: 0.5 },

  dropdownTrigger: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: '#C8DDD2', paddingHorizontal: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },

  selectedRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },

  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  roleIcon: { fontSize: 20 },

  selectedText: { fontSize: 16, fontWeight: '700' },

  placeholderText: { fontSize: 15, color: '#9AB5A8', fontWeight: '500' },

  chevron: { fontSize: 13, color: '#52796F', marginLeft: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },

  dropdownList: { backgroundColor: '#fff', borderRadius: 20, width: '100%', paddingVertical: 8, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16 },

  dropdownHeader: { fontSize: 16, fontWeight: '800', color: '#1B4332', textAlign: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E0EDE5', marginBottom: 4 },

  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 14, borderRadius: 12, marginHorizontal: 8 },

  dropdownItemText: { fontSize: 15, fontWeight: '600', color: '#1B4332', flex: 1 },

  checkMark: { fontSize: 18, fontWeight: '800' },

  separator: { height: 1, backgroundColor: '#F0F5F2', marginHorizontal: 16 },

  infoCard: { marginTop: 16, borderRadius: 14, borderWidth: 1.5, padding: 16 },

  infoCardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },

  infoCardSub: { fontSize: 13, lineHeight: 19, opacity: 0.85 },

  bottomSection: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 },

  continueBtn: { backgroundColor: '#1B4332', borderRadius: 16, paddingVertical: 16, alignItems: 'center', elevation: 6, shadowColor: '#1B4332', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12 },

  continueBtnDisabled: { backgroundColor: '#B7D5C4', shadowOpacity: 0, elevation: 0 },

  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

  headerImageWrapper: { width: '95%', alignSelf: 'center', overflow: 'hidden', borderRadius: 24, marginTop: 10 },

  headerImage: { width: '100%', height: 130 },
});

export default RoleSelection;