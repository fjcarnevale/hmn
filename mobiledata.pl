use strict;
use warnings;
use DBI;
use CGI;

my $cgi = CGI -> new;
my %params = $cgi->Vars;

my $username = 'root';
my $password = 'pass';

print 'hey';

$dbh = DBI->connect('dbi:mysql:db_url',$username,$password) or die "Connection error: $DBI::errstr\n";

my $sql = "INSERT INTO table_name VALUES";

#Parse first values here
$sql .= "($val1,$val2)";
for(int i=0;i<10;i++){
	$sql .= ",($val1,$val2)"
}
$sql .= ";";

my $sth = $dbh->prepare($sql) or die "Failed to prepare sql statement: '$sql'\n";

$sth->execute or die "SQL Error: $DBI::errstr\n";











