import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface MonthSelectorProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}) => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <View style={styles.container}>
      <View style={styles.yearSelector}>
        <TouchableOpacity onPress={() => onYearChange(selectedYear - 1)}>
          <Text style={styles.arrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.year}>{selectedYear}</Text>
        <TouchableOpacity onPress={() => onYearChange(selectedYear + 1)}>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.monthsGrid}>
        {months.map((month, index) => (
          <TouchableOpacity
            key={month}
            style={[
              styles.monthButton,
              selectedMonth === index && styles.selectedMonth
            ]}
            onPress={() => onMonthChange(index)}
          >
            <Text style={[
              styles.monthText,
              selectedMonth === index && styles.selectedMonthText
            ]}>
              {month.substring(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
  },
  yearSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  year: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
  },
  arrow: {
    fontSize: 24,
    color: '#007AFF',
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthButton: {
    width: '24%',
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  selectedMonth: {
    backgroundColor: '#007AFF',
  },
  monthText: {
    fontSize: 14,
    color: '#333',
  },
  selectedMonthText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});