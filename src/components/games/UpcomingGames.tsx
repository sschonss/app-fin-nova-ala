import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useGames } from '../../contexts/GamesContext';
import { useAuth } from '../../contexts/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AttendanceModalProps {
  gameId: string;
  visible: boolean;
  onClose: () => void;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ gameId, visible, onClose }) => {
  const { getGameAttendees } = useGames();
  const [loading, setLoading] = useState(true);
  const [attendees, setAttendees] = useState<{
    confirmed: User[];
    declined: User[];
    pending: User[];
  }>({ confirmed: [], declined: [], pending: [] });

  React.useEffect(() => {
    if (visible) {
      loadAttendees();
    }
  }, [visible, gameId]);

  const loadAttendees = async () => {
    try {
      setLoading(true);
      const result = await getGameAttendees(gameId);
      setAttendees(result);
    } catch (error) {
      console.error('Error loading attendees:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderUserList = (users: User[], status: 'confirmed' | 'declined' | 'pending') => {
    const statusColors = {
      confirmed: '#34C759',
      declined: '#FF3B30',
      pending: '#8E8E93',
    };

    return users.map(user => (
      <View key={user.id} style={styles.userItem}>
        <View style={[styles.userStatus, { backgroundColor: statusColors[status] }]} />
        <Text style={styles.userName}>{user.name}</Text>
      </View>
    ));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Lista de Presença</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <ScrollView style={styles.attendeesList}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Confirmados ({attendees.confirmed.length})
                </Text>
                {renderUserList(attendees.confirmed, 'confirmed')}
                {attendees.confirmed.length === 0 && (
                  <Text style={styles.emptyMessage}>Nenhum jogador confirmado</Text>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Não vão ({attendees.declined.length})
                </Text>
                {renderUserList(attendees.declined, 'declined')}
                {attendees.declined.length === 0 && (
                  <Text style={styles.emptyMessage}>Nenhum jogador recusou</Text>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Pendentes ({attendees.pending.length})
                </Text>
                {renderUserList(attendees.pending, 'pending')}
                {attendees.pending.length === 0 && (
                  <Text style={styles.emptyMessage}>Nenhum jogador pendente</Text>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

export const UpcomingGames = () => {
  const { upcomingGames, confirmAttendance, loading } = useGames();
  const { user } = useAuth();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (upcomingGames.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noGamesText}>Nenhum jogo agendado</Text>
      </View>
    );
  }

  const formatGameDate = (date: Date) => {
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    return {
      weekDay: dayNames[date.getDay()],
      date: `${day}/${month}`,
      time: '21:00',
    };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Próximos Jogos</Text>
      {upcomingGames.map(game => {
        const { weekDay, date, time } = formatGameDate(game.date);
        const userStatus = game.attendance[user?.id] || 'pending';
        
        return (
          <TouchableOpacity 
            key={game.id} 
            style={styles.gameCard}
            onPress={() => setSelectedGame(game.id)}
          >
            <View style={styles.gameInfo}>
              <Text style={styles.weekDay}>{weekDay}</Text>
              <Text style={styles.dateTime}>
                {date} às {time}
              </Text>
              <Text style={styles.location}>{game.location}</Text>
            </View>
            <View style={styles.attendanceButtons}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  userStatus === 'confirmed' && styles.selectedButton,
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  confirmAttendance(game.id, 'confirmed');
                }}
              >
                <Text style={[
                  styles.buttonText,
                  userStatus === 'confirmed' && styles.selectedButtonText,
                ]}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.declineButton,
                  userStatus === 'declined' && styles.selectedButton,
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  confirmAttendance(game.id, 'declined');
                }}
              >
                <Text style={[
                  styles.buttonText,
                  userStatus === 'declined' && styles.selectedButtonText,
                ]}>✗</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );
      })}

      <AttendanceModal
        gameId={selectedGame || ''}
        visible={!!selectedGame}
        onClose={() => setSelectedGame(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  gameCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gameInfo: {
    flex: 1,
  },
  weekDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  attendanceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    borderColor: '#34C759',
  },
  declineButton: {
    borderColor: '#FF3B30',
  },
  selectedButton: {
    backgroundColor: '#fff',
  },
  buttonText: {
    fontSize: 20,
  },
  selectedButtonText: {
    color: '#fff',
  },
  noGamesText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  attendeesList: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  userStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    color: '#333',
  },
  emptyMessage: {
    color: '#8E8E93',
    fontStyle: 'italic',
    marginTop: 4,
  },
});