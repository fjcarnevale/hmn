#!/usr/bin/perl
use LWP::Simple;
use FindBin qw($Bin);
use lib "$Bin/JSON-2.53/lib/";
use JSON;
use strict;
use warnings;

my $to_email = "fjcarnevale\@gmail.com";
my $local_file_path = "./files/";
my $url = "http://users.wpi.edu/~fcarnevale/hmn/js/objects.json";

my $json = get( $url );
die "Could not get \"$url\"\n" unless defined $json;

my $hash_ref = decode_json($json);
my %json_hash = %$hash_ref;

my %failed = ();


foreach my $key(sort keys %json_hash){
	printf("Testing: %-32s",$key);
	my $obj = get( $json_hash{$key}{'link'} );
	# Try to get the object via HTTP request
	if(!defined $obj 
		&& !open($obj,"<",$local_file_path.$json_hash{$key}{'link'})
		&& !open($obj,"<",$json_hash{$key}{'link'})){
			print "Failure\n";
			$failed{$key} = $json_hash{$key}{'link'};
	}else{
		print "Success\n";
	}
}

# Exit here if none of the links failed
die "All links succeeded\n" unless keys %failed;

#Otherwise print the failed links and send an email
my $message = "The following links failed\n";

foreach my $key(keys %failed){
	$message .= "Object: ".$key."\n"."Link: ".$failed{$key}."\n\n";
}

print $message;

sendEmail($to_email,"hmn\@cs.wpi.edu","HMN Link Failures",$message);

sub sendEmail{

	my($to, $from, $subject, $message) = @_;
	my $sendmail = '/usr/lib/sendmail';
	open(MAIL, "|$sendmail -oi -t");
	print MAIL "From: $from\n";
	print MAIL "To: $to\n";
	print MAIL "Subject: $subject\n\n";
	print MAIL "$message\n";
	close(MAIL);
}












